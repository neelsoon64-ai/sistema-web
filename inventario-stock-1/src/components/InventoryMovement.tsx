
import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Save, ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';
import { db } from '../services/db';
import { Product } from '../types';

const InventoryMovement: React.FC = () => {
  const [tipo, setTipo] = useState<'Entrada' | 'Salida'>('Entrada');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    db.getProducts().then(setProducts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoId || !cantidad) return;

    setIsSubmitting(true);
    try {
      const selectedProduct = products.find(p => p.id === productoId);
      await db.addMovement({
        productoId,
        productoNombre: selectedProduct?.nombre || 'Desconocido',
        tipo,
        cantidad: Number(cantidad),
        motivo: motivo || (tipo === 'Entrada' ? 'Ingreso de mercadería' : 'Retiro para oficina'),
        usuario: 'Administrador'
      });
      
      setSuccess(true);
      setProductoId('');
      setCantidad('');
      setMotivo('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === productoId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b-2 border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-[#004a99] uppercase">Gestión de Flujo de Stock</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registrar movimientos en la base de datos central</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
          {success && (
            <div className="absolute inset-0 bg-green-600/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white animate-fade-in">
              <CheckCircle2 className="w-16 h-16 mb-2" />
              <p className="font-black text-lg uppercase tracking-tighter">Movimiento Registrado</p>
              <p className="text-xs opacity-90 mt-1 uppercase font-bold">El stock ha sido actualizado con éxito</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTipo('Entrada')}
                className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-xl font-black text-xs transition-all border-2 ${
                  tipo === 'Entrada' 
                    ? 'bg-green-600 text-white border-green-700 shadow-lg scale-[1.02]' 
                    : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <ArrowDownLeft className="w-5 h-5" /> ENTRADA (+)
              </button>
              <button
                type="button"
                onClick={() => setTipo('Salida')}
                className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-xl font-black text-xs transition-all border-2 ${
                  tipo === 'Salida' 
                    ? 'bg-red-600 text-white border-red-700 shadow-lg scale-[1.02]' 
                    : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <ArrowUpRight className="w-5 h-5" /> SALIDA (-)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Producto</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-700 focus:border-[#004a99] outline-none transition-all"
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  required
                >
                  <option value="">Seleccione...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (Disponibles: {p.stockActual})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cantidad</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold text-black focus:border-[#004a99] outline-none"
                  placeholder="0"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Motivo / Observaciones</label>
              <textarea 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-medium text-black focus:border-[#004a99] outline-none min-h-[100px] resize-none"
                placeholder="Detalle el motivo del movimiento..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#004a99] hover:bg-[#003366] disabled:bg-gray-300 text-white font-black py-5 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 group uppercase tracking-widest"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Confirmar en Sistema
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-2 text-[#004a99] mb-6">
              <ClipboardList className="w-5 h-5" />
              <h3 className="font-black text-xs uppercase tracking-widest">Vista Previa</h3>
            </div>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Stock Actual</span>
                  <p className="text-3xl font-black text-gray-800">{selectedProduct.stockActual}</p>
                </div>
                <div className="p-4 bg-[#004a99]/5 rounded-xl border border-[#004a99]/20">
                  <span className="text-[10px] font-bold text-[#004a99] uppercase block mb-1">Stock Final</span>
                  <p className="text-xl font-black text-[#004a99]">
                    {tipo === 'Entrada' 
                      ? selectedProduct.stockActual + (Number(cantidad) || 0)
                      : selectedProduct.stockActual - (Number(cantidad) || 0)
                    }
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Seleccione un producto para previsualizar el cambio.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryMovement;
