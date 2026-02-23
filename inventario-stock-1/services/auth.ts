
import { User } from '../types';

const STORAGE_KEY = 'chubut_users_v5_final';

const INITIAL_USERS: (User & { password: string })[] = [
  {
    id: '1',
    nombre: 'Nelson Administrador',
    email: 'neelsoon64@gmail.com',
    password: 'Luna2187',
    role: 'ADMIN',
    avatar: 'NA'
  },
  {
    id: '2',
    nombre: 'Operador de Stock',
    email: 'usuario@chubut.gov.ar',
    password: 'User123',
    role: 'USER',
    avatar: 'OS'
  }
];

const loadUsers = (): (User & { password: string })[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error("Error parsing users", e);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

export const getUsers = () => {
  return loadUsers();
};

export const addUser = (newUser: User & { password: string }) => {
  const currentUsers = loadUsers();
  const updated = [...currentUsers, newUser];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteUser = (id: string) => {
  const currentUsers = loadUsers();
  // Forzamos comparación estricta de strings para evitar errores de tipo
  const filtered = currentUsers.filter(u => String(u.id) !== String(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const updateUserRole = (id: string, newRole: 'ADMIN' | 'USER') => {
  const currentUsers = loadUsers();
  const updated = currentUsers.map(u => 
    String(u.id) === String(id) ? { ...u, role: newRole } : u
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const authenticate = (email: string, pass: string): User | null => {
  const currentUsers = loadUsers();
  const user = currentUsers.find(u => u.email === email && u.password === pass);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};
