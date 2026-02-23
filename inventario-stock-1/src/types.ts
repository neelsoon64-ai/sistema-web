export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PRODUCTOS = 'PRODUCTOS',
  MOVIMIENTOS = 'MOVIMIENTOS',
  INVENTARIO = 'INVENTARIO',
  CONFIGURACION = 'CONFIGURACION'
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  nombre: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  precio: number;
}

export interface Movement {
  id: string;
  fecha: string;
  productoId: string;
  productoNombre: string;
  tipo: 'Entrada' | 'Salida';
  cantidad: number;
  motivo: string;
  usuario: string;
}

// Added missing interface for Image Studio history
export interface ImageGeneration {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

// Added missing interfaces for Search Studio grounding and history
export interface GroundingUrl {
  title: string;
  uri: string;
  type: 'web' | 'maps';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  groundingUrls?: GroundingUrl[];
}
