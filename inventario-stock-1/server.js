import express from 'express';
import pg from 'pg'; // Cambiamos la forma de importar para evitar el error de "require"
const { Pool } = pg;
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
