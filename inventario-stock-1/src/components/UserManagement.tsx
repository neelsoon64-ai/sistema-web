
import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, ShieldCheck, UserCog, Mail, Key, X, Save, AlertCircle } from 'lucide-react';
import { getUsers, addUser, deleteUser, updateUserRole } from '../services/auth';
import { User, UserRole } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('USER');

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    const data = getUsers();
    setUsers([...data]); 
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPass) return;

    const newUser = {
      id: Date.now().toString(),
      nombre: newName,
      email: newEmail,
      password: newPass,
      role: newRole,
      avatar: newName.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2)
    };
    
    addUser(newUser);
    setIsAdding(false);
    resetForm();
    refreshUsers();
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPass('');
    setNewRole('USER');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿ESTÁ SEGURO? Esta acción ELIMINARÁ permanentemente el acceso de este usuario al sistema.')) {
      deleteUser(id);
      // Forzamos actualización local inmediata
      setUsers(prev => prev.filter(u => String(u.id) !== String(id)));
    }
  };

  const toggleRole = (id: string, currentRole: UserRole) => {
    const targetRole: UserRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    updateUserRole(id, targetRole);
    refreshUsers();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="border-b-2 border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <UserCog className="w-5 h-5 text-[#004a99]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#004a99] uppercase tracking-tight">Gestión de Personal</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Control de Accesos Administrativos</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#004a99] hover:bg-[#003366] text-white px-6 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> DAR DE ALTA AGENTE
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-[#004a99] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold uppercase tracking-tight text-lg">Nuevo Registro</h3>
                <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest">Secretaría de Trabajo</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="hover:rotate-90 transition-transform">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Nombre y Apellido</label>
                <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-black text-black outline-none" placeholder="Nombre completo" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pl-11 text-sm font-black text-black outline-none" placeholder="agente@chubut.gov.ar" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Contraseña</label>
                <input type="password" required value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-black text-black outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Rol</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-black text-black outline-none">
                  <option value="USER">OPERADOR</option>
                  <option value="ADMIN">ADMINISTRADOR</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#004a99] text-white font-black py-4 rounded-xl hover:bg-[#003366] transition-colors shadow-lg uppercase text-[10px] tracking-widest">
                GUARDAR AGENTE
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">Nombre</th>
                <th className="px-6 py-5">Email</th>
                <th className="px-6 py-5">Acceso</th>
                <th className="px-6 py-5 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 font-black text-gray-800 uppercase tracking-tight">{user.nombre}</td>
                  <td className="px-6 py-5 text-gray-500 font-mono text-xs">{user.email}</td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleRole(user.id, user.role)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black border ${
                        user.role === 'ADMIN' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-3 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-amber-800 uppercase tracking-tight">Atención Administrador</h4>
          <p className="text-[11px] text-amber-700 mt-1 leading-relaxed font-medium">
            La eliminación de usuarios es irreversible. Al borrar a un usuario, este perderá acceso instantáneo a la plataforma de gestión.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
