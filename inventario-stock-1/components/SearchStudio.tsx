
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Globe, MessageSquare, ExternalLink, Hash, MapPin, Loader2 } from 'lucide-react';
import { searchWithGrounding } from '../services/gemini';
import { ChatMessage } from '../types';

const SearchStudio: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Ubicación denegada", err)
      );
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    const userMessage: ChatMessage = { role: 'user', content: currentInput };
    
    // Actualización inmediata para el mensaje del usuario
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await searchWithGrounding(currentInput, coords);
      const modelMessage: ChatMessage = { 
        role: 'model', 
        content: result.text, 
        groundingUrls: result.urls 
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error("Error en búsqueda:", err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "Lo siento, hubo un error técnico al procesar tu búsqueda. Por favor, verifica tu conexión o intenta nuevamente." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-6 animate-fade-in">
      <div className="border-b-2 border-gray-100 pb-4">
        <h2 className="text-xl font-black text-[#004a99] uppercase tracking-tight">Buscador Inteligente de Recursos</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">IA conectada a la red provincial y global</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar flex flex-col" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="my-auto flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Consulta al Sistema Central</h3>
            <p className="text-xs text-gray-400 max-w-sm mt-2 font-medium">Busca normativas, proveedores, comparativas de precios o datos técnicos con el respaldo de la IA de Google.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-blue-50 border-blue-100 text-black font-semibold' 
                : 'bg-white border-gray-100 text-gray-700'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${msg.role === 'user' ? 'bg-[#004a99] text-white' : 'bg-orange-500 text-white'}`}>
                  {msg.role === 'user' ? 'TÚ' : 'IA'}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{msg.role === 'user' ? 'Usuario' : 'Asistente Chubut'}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest w-full mb-1">Fuentes Verificadas:</span>
                  {msg.groundingUrls.map((url, j) => (
                    <a key={j} href={url.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 border border-blue-100">
                      {url.type === 'maps' ? <MapPin className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      {url.title}
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analizando red global...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="bg-white p-3 border-2 border-gray-100 rounded-2xl shadow-xl flex items-center gap-2 focus-within:border-[#004a99] transition-all">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta administrativa, técnica o de mercado..."
          className="flex-1 bg-transparent px-4 py-3 text-sm font-medium focus:outline-none text-black placeholder:text-gray-400"
          disabled={isLoading}
        />
        <button 
          disabled={isLoading || !input.trim()}
          className="bg-[#004a99] hover:bg-[#003366] disabled:bg-gray-200 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default SearchStudio;
