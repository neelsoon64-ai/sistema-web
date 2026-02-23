import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, X, Save, Trash2 } from 'lucide-react';
import { db } from '../services/db';
import { Product, User } from '../types';

interface InventoryListProps {
  currentUser: User | null;
}

const InventoryList: React.FC<InventoryListProps> = ({ currentUser }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    codigo: '',
    nombre: '',
    stockActual: 0,
    stockMinimo: 5,
    precio: 0
  });

  const loadProducts = async () => {
    setLoading(true);
    const data = await db.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    await db.saveProduct({ ...newProduct, id });
    setNewProduct({ codigo: '', nombre: '', stockActual: 0, stockMinimo: 5, precio: 0 });
    setShowForm(false);
    loadProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return;
    await db.deleteProduct(id);
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-[#004a99]" />
          <h2 className="font-bold text-gray-800 text-lg">Inventario de Stock</h2>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Nuevo Producto
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#004a99]">Alta de Producto</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Código</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#004a99] outline-none"
                  value={newProduct.codigo}
                  onChange={e => setNewProduct({...newProduct, codigo: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nombre</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#004a99] outline-none"
                  value={newProduct.nombre}
                  onChange={e => setNewProduct({...newProduct, nombre: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Stock Inicial</label>
                  <input 
                    type="number" 
                    required
                    className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#004a99] outline-none"
                    value={newProduct.stockActual}
                    onChange={e => setNewProduct({...newProduct, stockActual: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Stock Mínimo</label>
                  <input 
                    type="number" 
                    required
                    className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#004a99] outline-none"
                    value={newProduct.stockMinimo}
                    onChange={e => setNewProduct({...newProduct, stockMinimo: Number(e.target.value)})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#004a99] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#003366] flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-4 border-b">Código</th>
                <th className="px-6 py-4 border-b">Producto</th>
                <th className="px-6 py-4 border-b text-center">Stock</th>
                <th className="px-6 py-4 border-b text-right">Estado</th>
                {currentUser?.role === 'ADMIN' && <th className="px-6 py-4 border-b text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={currentUser?.role === 'ADMIN' ? 5 : 4} className="p-10 text-center text-gray-400">Cargando productos...</td></tr>
              ) : products.length > 0 ? (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{item.codigo}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nombre}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-gray-600">{item.stockActual}</td>
                    <td className="px-6 py-4 text-right">
                      {item.stockActual <= item.stockMinimo ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" /> Stock Bajo
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">Disponible</span>
                      )}
                    </td>
                    {currentUser?.role === 'ADMIN' && (
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDeleteProduct(item.id)}
                          className="text-red-500 hover:text-red-700 p-2 transition-colors"
                          title="Eliminar Producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={currentUser?.role === 'ADMIN' ? 5 : 4} className="px-6 py-10 text-center text-gray-400 text-sm">No se encontraron productos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
