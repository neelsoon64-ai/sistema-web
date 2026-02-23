import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      codigo TEXT,
      nombre TEXT,
      stock_actual INTEGER,
      stock_minimo INTEGER,
      precio NUMERIC
    );
    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      producto_id TEXT,
      producto_nombre TEXT,
      tipo TEXT,
      cantidad INTEGER,
      motivo TEXT,
      usuario TEXT
    );
  `);
}
initDb();

app.get('/api/products', async (req, res) => {
  const result = await pool.query('SELECT id, codigo, nombre, stock_actual as "stockActual", stock_minimo as "stockMinimo", precio FROM products');
  res.json(result.rows);
});

app.post('/api/products', async (req, res) => {
  const { id, codigo, nombre, stockActual, stockMinimo, precio } = req.body;
  await pool.query(
    'INSERT INTO products (id, codigo, nombre, stock_actual, stock_minimo, precio) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET codigo=$2, nombre=$3, stock_actual=$4, stock_minimo=$5, precio=$6',
    [id, codigo, nombre, stockActual, stockMinimo, precio]
  );
  res.sendStatus(200);
});

app.delete('/api/products/:id', async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.sendStatus(200);
});

app.get('/api/movements', async (req, res) => {
  const result = await pool.query('SELECT id, fecha, producto_id as "productoId", producto_nombre as "productoNombre", tipo, cantidad, motivo, usuario FROM movements ORDER BY fecha DESC');
  res.json(result.rows);
});

app.delete('/api/movements/:id', async (req, res) => {
  await pool.query('DELETE FROM movements WHERE id = $1', [req.params.id]);
  res.sendStatus(200);
});

app.post('/api/movements', async (req, res) => {
  const { productoId, productoNombre, tipo, cantidad, motivo, usuario } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO movements (id, producto_id, producto_nombre, tipo, cantidad, motivo, usuario) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, productoId, productoNombre, tipo, cantidad, motivo, usuario]
    );
    
    if (tipo === 'Entrada') {
      await client.query('UPDATE products SET stock_actual = stock_actual + $1 WHERE id = $2', [cantidad, productoId]);
    } else {
      await client.query('UPDATE products SET stock_actual = stock_actual - $1 WHERE id = $2', [cantidad, productoId]);
    }
    await client.query('COMMIT');
    res.sendStatus(200);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).send(e.message);
  } finally {
    client.release();
  }
});

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for SPA
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
