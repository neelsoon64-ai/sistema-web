
import React, { useState } from 'react';
import { Send, Download, RefreshCcw, Layout, Maximize2, Trash2, Wand2, Zap, Sparkles } from 'lucide-react';
import { generateImage } from '../services/gemini';
import { ImageGeneration } from '../types';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<ImageGeneration[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageGeneration | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(prompt, aspectRatio, isHighQuality);
      const newImage: ImageGeneration = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        prompt,
        timestamp: Date.now()
      };
      setHistory(prev => [newImage, ...prev]);
      setSelectedImage(newImage);
      setPrompt('');
    } catch (err) {
      console.error(err);
      alert("Error al generar la imagen. Verifica tu conexión.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="p-4 lg:p-8 h-full flex flex-col gap-8">
      {/* Search Bar / Input */}
      <div className="glass p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-end shadow-xl">
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <Wand2 className="w-3 h-3" /> Prompt Creativo
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe tu visión... ej: 'Un astronauta tocando el saxofón en Marte, estilo impresionista'"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px] resize-none"
          />
        </div>
        
        <div className="flex md:flex-col gap-3 w-full md:w-56">
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {(['1:1', '16:9', '9:16'] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${aspectRatio === ratio ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500'}`}
              >
                {ratio}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setIsHighQuality(false)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${!isHighQuality ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
            >
              <Zap className="w-3 h-3" /> Flash
            </button>
            <button
              onClick={() => setIsHighQuality(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${isHighQuality ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
            >
              <Sparkles className="w-3 h-3" /> Pro
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-900/20"
          >
            {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isGenerating ? 'Creando...' : 'Generar'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
        <div className="lg:col-span-8 glass rounded-3xl overflow-hidden relative group shadow-2xl flex items-center justify-center bg-gray-900">
          {selectedImage ? (
            <>
              <img src={selectedImage.url} alt={selectedImage.prompt} className="max-w-full max-h-full object-contain animate-fade-in" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm text-gray-200 line-clamp-2 mb-4">{selectedImage.prompt}</p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => downloadImage(selectedImage.url, `gemini-art-${selectedImage.id}.png`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" /> Pantalla Completa
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                <Layout className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm">Tus creaciones aparecerán aquí</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Galería de Sesión</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {history.map((img) => (
              <div 
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`group relative aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage?.id === img.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent hover:border-white/20'}`}
              >
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistory(history.filter(h => h.id !== img.id));
                      if (selectedImage?.id === img.id) setSelectedImage(null);
                    }}
                    className="p-2 bg-red-600/80 rounded-lg text-white hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
