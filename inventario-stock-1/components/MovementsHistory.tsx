
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ArrowDownLeft, ArrowUpRight, Loader2, Calendar, Trash2 } from 'lucide-react';
import { db } from '../services/db';
import { Movement, User } from '../types';

interface MovementsHistoryProps {
  currentUser: User | null;
}

const MovementsHistory: React.FC<MovementsHistoryProps> = ({ currentUser }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadMovements = async () => {
    setIsLoading(true);
    const data = await db.getMovements();
    setMovements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const handleDeleteMovement = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este registro del historial?')) return;
    await db.deleteMovement(id);
    loadMovements();
  };

  const filteredMovements = movements.filter(m => 
    m.productoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredMovements.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // Cabeceras del CSV
    const headers = ["ID", "Fecha", "Producto", "Tipo", "Cantidad", "Responsable", "Motivo"];
    
    // Mapeo de datos a filas
    const rows = filteredMovements.map(m => [
      m.id,
      m.fecha,
      m.productoNombre,
      m.tipo,
      m.cantidad,
      m.usuario,
      `"${m.motivo.replace(/"/g, '""')}"` // Escapar comillas en el motivo
    ]);

    // Construcción del contenido CSV (con BOM para compatibilidad con acentos en Excel)
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    // Creación del Blob y descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `auditoria_movimientos_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b-2 border-gray-100 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2b81a1]">Historial Transaccional</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registro auditable de la Secretaría</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-[#2b81a1]" /> EXPORTAR AUDITORÍA (CSV)
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Filtrar por producto, usuario o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2b81a1]/20 outline-none transition-all"
          />
        </div>
        <button 
          onClick={loadMovements}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-10 h-10 text-[#2b81a1] animate-spin" />
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recuperando registros...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Fecha / Hora</th>
                  <th className="px-6 py-4">Producto Afectado</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Cant.</th>
                  <th className="px-6 py-4">Responsable</th>
                  <th className="px-6 py-4">Motivo / Observación</th>
                  {currentUser?.role === 'ADMIN' && <th className="px-6 py-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {mov.fecha}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">{mov.productoNombre}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tight ${
                        mov.tipo === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {mov.tipo === 'Entrada' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {mov.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-gray-800">{mov.cantidad}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">
                           {mov.usuario.charAt(0).toUpperCase()}
                         </div>
                         <span className="text-gray-600 font-medium">{mov.usuario}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 italic text-xs max-w-xs truncate">{mov.motivo}</td>
                    {currentUser?.role === 'ADMIN' && (
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDeleteMovement(mov.id)}
                          className="text-red-500 hover:text-red-700 p-2 transition-colors"
                          title="Eliminar Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMovements.length === 0 && (
            <div className="p-20 text-center text-gray-400 italic flex flex-col items-center gap-3">
              <div className="p-4 bg-gray-50 rounded-full"><Search className="w-8 h-8 opacity-20" /></div>
              No se encontraron movimientos registrados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MovementsHistory;
