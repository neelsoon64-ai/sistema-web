
import React, { useState, useEffect } from 'react';
import { Film, Play, Loader2, Key, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { generateVideo } from '../services/gemini';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    // @ts-ignore
    const result = await window.aistudio.hasSelectedApiKey();
    setHasKey(result);
  };

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true); // Assume success per instructions
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const apiKey = process.env.API_KEY || '';
      const url = await generateVideo(prompt, apiKey);
      setVideoUrl(url);
    } catch (err: any) {
      if (err.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
      setError("Video generation failed. Ensure your selected API key has Veo access.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex items-center justify-center min-h-full p-8">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold">API Key Required</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Video generation requires a selected API key from a paid GCP project. 
            Veo 3.1 features are available for developers with appropriate billing enabled.
          </p>
          <div className="pt-4 space-y-4">
            <button 
              onClick={handleOpenKeySelector}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors underline decoration-gray-700"
            >
              Learn about billing <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 flex flex-col items-center gap-8 h-full">
      <div className="w-full max-w-4xl space-y-8">
        {/* Prompter */}
        <div className="glass p-8 rounded-3xl shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Film className="w-3.5 h-3.5" /> Scene Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic drone shot of a misty mountain range during sunrise, hyper-realistic, 8k..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[150px] resize-none"
            />
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all shadow-xl shadow-blue-900/30"
          >
            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
            {isGenerating ? 'Synthesizing Magic...' : 'Generate Cinematic Video'}
          </button>

          {isGenerating && (
            <div className="flex flex-col items-center gap-4 py-4 animate-pulse">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-widest">
                <RefreshCw className="w-4 h-4 animate-spin-slow" /> Veo 3.1 Fast is processing
              </div>
              <p className="text-gray-500 text-xs italic">"Great things take time. Usually about 30-60 seconds."</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Video Preview */}
        {videoUrl && (
          <div className="glass rounded-3xl overflow-hidden shadow-2xl animate-fade-in group">
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop 
              className="w-full aspect-video bg-black object-contain"
            />
            <div className="p-4 bg-gray-900/50 backdrop-blur-md flex items-center justify-between">
              <div className="text-xs text-gray-400 font-medium">Veo 3.1 • 720p • 16:9</div>
              <button 
                onClick={() => window.open(videoUrl)}
                className="text-blue-400 text-xs font-bold hover:underline"
              >
                Download Master
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStudio;
