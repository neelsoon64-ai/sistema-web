import { Product, Movement, User } from '../types';

const API_URL = '/api';

export const db = {
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products`);
    return res.json();
  },

  async saveProduct(product: Product): Promise<void> {
    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getMovements(): Promise<Movement[]> {
    const res = await fetch(`${API_URL}/movements`);
    return res.json();
  },

  async addMovement(movementData: Omit<Movement, 'id' | 'fecha'>): Promise<void> {
    await fetch(`${API_URL}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movementData),
    });
  },

  async deleteMovement(id: string): Promise<void> {
    await fetch(`${API_URL}/movements/${id}`, {
      method: 'DELETE',
    });
  },

  async getStats() {
    const products = await this.getProducts();
    const movements = await this.getMovements();
    const today = new Date().toDateString();
    
    return {
      totalProducts: products.length,
      lowStock: products.filter(p => p.stockActual <= p.stockMinimo).length,
      movementsToday: movements.filter(m => new Date(m.fecha).toDateString() === today).length,
      outOfStock: products.filter(p => p.stockActual <= 0).length,
      recentMovements: movements.slice(0, 5)
    };
  }
};
