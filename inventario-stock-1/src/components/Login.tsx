
import React, { useState } from 'react';
import { User as UserIcon, Lock, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import { authenticate } from '../services/auth';
import { User } from '../types';

const LOGO_URL = 'https://yt3.googleusercontent.com/0ZFjJRm21feVBJcdWfIOcJtJQsYLzYW1hKnSGfjU8RFu2sdyjhfNeChaQ1FUtzsdxxqZb4qS=s900-c-k-c0x00ffffff-no-rj';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const authenticatedUser = authenticate(email, password);
      if (authenticatedUser) {
        onLogin(authenticatedUser);
      } else {
        setError('Acceso denegado. Verifique sus credenciales.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Fondo decorativo con colores institucionales */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#004a99]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F57C00]/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

      {/* Branding Superior */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center animate-fade-in relative z-10">
        <div className="p-2 bg-white rounded-2xl shadow-xl">
          <img src={LOGO_URL} className="w-28 h-28 object-contain" alt="Escudo Chubut" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#F57C00] tracking-tight uppercase">Secretaría de Trabajo</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Provincia del Chubut</p>
        </div>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in-up relative z-10">
        <div className="bg-[#004a99] p-8 text-white text-center">
          <h2 className="text-xl font-bold uppercase tracking-tight">Panel de Gestión</h2>
          <p className="text-[10px] text-white/70 mt-1 uppercase tracking-widest font-black">Acceso Administrativo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-bold uppercase tracking-tighter">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">Correo Institucional</label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#004a99] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@chubut.gov.ar"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3.5 pl-10 pr-4 text-sm text-black font-bold focus:bg-white focus:border-[#004a99] outline-none transition-all placeholder:font-normal placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#004a99] transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3.5 pl-10 pr-4 text-sm text-black font-bold focus:bg-white focus:border-[#004a99] outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#004a99] hover:bg-[#003366] disabled:bg-gray-400 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-[#004a99]/20 flex items-center justify-center gap-2 group active:scale-[0.98] uppercase tracking-widest text-xs"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Ingresar al Sistema
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-12 flex flex-col items-center gap-2 relative z-10">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">© 2024 Gobierno del Chubut</p>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-[#FFCE00]"></div>
          <div className="w-2 h-2 rounded-full bg-[#F57C00]"></div>
          <div className="w-2 h-2 rounded-full bg-[#004a99]"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}} />
    </div>
  );
};

export default Login;
