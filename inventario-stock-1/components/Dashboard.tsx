
import React, { useState, useEffect } from 'react';
import { RefreshCcw, BellRing, Smartphone, ClipboardCheck, TrendingUp, History, Zap, Loader2 } from 'lucide-react';
import { db } from '../services/db';

const Dashboard: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await db.getStats();
    setStatsData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const stats = statsData ? [
    { label: 'Productos en Stock', value: statsData.totalProducts, color: 'text-blue-600', icon: ClipboardCheck },
    { label: 'Alertas Reposición', value: statsData.lowStock, color: 'text-orange-600', icon: BellRing },
    { label: 'Movimientos Hoy', value: statsData.movementsToday, color: 'text-indigo-600', icon: TrendingUp },
    { label: 'Sin Existencias', value: statsData.outOfStock, color: 'text-red-600', icon: Zap },
  ] : [];

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#004a99] animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronizando con Google Sheets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-[#004a99] uppercase tracking-tight">
            {greeting}, Administrador
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Panel de Control • Google Sheet Conectado
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors shadow-sm">
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-2xl font-black block leading-none ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#004a99] p-12 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
         <div className="relative z-10 max-w-xl">
           <h3 className="text-2xl font-black mb-4 italic tracking-tighter">Bienvenido al Centro de Gestión</h3>
           <p className="text-sm text-blue-100 leading-relaxed opacity-80">
             El sistema se encuentra sincronizado con la planilla central de Google. Cualquier cambio en la hoja de cálculo se reflejará aquí automáticamente.
           </p>
         </div>
         <History className="absolute right-0 bottom-0 w-64 h-64 text-white/5 -mb-20 -mr-20" />
      </div>
    </div>
  );
};

export default Dashboard;
