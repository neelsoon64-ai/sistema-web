
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Camera, CameraOff, Power } from 'lucide-react';
import { createGeminiClient, encodePCM, decodePCM, decodeAudioToBuffer } from '../services/gemini';
import { Modality } from '@google/genai';

const VoiceStudio: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = useCallback(() => {
    if (sessionRef.current) sessionRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsActive(false);
    setIsVideoOn(false);
  }, []);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoOn });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = createGeminiClient();
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "Eres un asistente administrativo inteligente para la Secretaría de Trabajo. Ayudas a gestionar inventarios y responder dudas de oficina.",
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmData = encodePCM(new Uint8Array(int16.buffer));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outAudioContextRef.current) {
              const ctx = outAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const decoded = await decodeAudioToBuffer(decodePCM(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = decoded;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += decoded.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.inputTranscription) setTranscription(prev => [...prev.slice(-5), `Tú: ${msg.serverContent!.inputTranscription!.text}`]);
            if (msg.serverContent?.outputTranscription) setTranscription(prev => [...prev.slice(-5), `AI: ${msg.serverContent!.outputTranscription!.text}`]);
          },
          onclose: () => setIsActive(false),
        }
      });
      setIsActive(true);
    } catch (err) { alert("Error al activar asistente."); }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="border-b-2 border-gray-100 pb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#2b81a1]">Asistente de Voz Corporativo</h2>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${isActive ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
          {isActive ? 'CONECTADO' : 'DESCONECTADO'}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-sm border border-gray-100 card-shadow overflow-hidden relative flex flex-col">
        <div className="flex-1 flex items-center justify-center p-12 bg-gray-50/30">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-xl ${isActive ? 'bg-blue-600 scale-110 shadow-blue-200' : 'bg-gray-200'}`}>
            <Mic className={`w-12 h-12 ${isActive ? 'text-white animate-pulse' : 'text-gray-400'}`} />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-24 p-6 pointer-events-none flex flex-col gap-2">
          {transcription.map((line, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded text-xs font-medium text-gray-600 border border-gray-200 shadow-sm self-start">
              {line}
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-center gap-4">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-lg transition-colors ${isMuted ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button onClick={isActive ? stopSession : startSession} className={`px-12 py-4 rounded-lg font-bold text-white transition-all shadow-lg ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2b81a1] hover:bg-[#21657e]'}`}>
            {isActive ? 'Finalizar Llamada' : 'Iniciar Asistencia'}
          </button>
          <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-4 rounded-lg transition-colors ${isVideoOn ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
            {isVideoOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceStudio;
