
import { GoogleGenAI } from "@google/genai";

// Ensure Gemini client uses process.env.API_KEY exclusively and uses named parameters
export const createGeminiClient = (apiKeyOverride?: string) => {
  return new GoogleGenAI({ apiKey: apiKeyOverride || process.env.API_KEY });
};

// --- Image Generation ---
export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' = '1:1', isHighQuality: boolean = false) => {
  const ai = createGeminiClient();
  const model = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { 
        aspectRatio,
        ...(isHighQuality ? { imageSize: '1K' } : {})
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data received from model");
};

// --- Video Generation (Veo) ---
export const generateVideo = async (prompt: string, apiKey: string) => {
  const ai = createGeminiClient(apiKey);
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// --- Search & Maps Grounding ---
export const searchWithGrounding = async (query: string, coords?: { lat: number, lng: number }) => {
  const ai = createGeminiClient();
  
  const tools: any[] = [{ googleSearch: {} }];
  let toolConfig = undefined;

  // Use Maps grounding for Gemini 2.5 series models as required
  if (coords) {
    tools.push({ googleMaps: {} });
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: coords.lat,
          longitude: coords.lng
        }
      }
    };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest', // Modelo estable para grounding dual
    contents: query,
    config: {
      tools,
      toolConfig
    }
  });

  const text = response.text || "No se pudo generar una respuesta detallada en este momento.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const urls = groundingChunks
    .map((chunk: any) => {
      if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri, type: 'web' };
      if (chunk.maps) return { title: chunk.maps.title || 'Ver en Google Maps', uri: chunk.maps.uri, type: 'maps' };
      return null;
    })
    .filter(Boolean);

  return { text, urls };
};

// --- Audio Utility ---
export function encodePCM(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodePCM(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioToBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
