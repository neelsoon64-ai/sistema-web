// 1. Importamos el cliente de Vercel
const { db } = require('@vercel/postgres');

async function ejecutarConsulta() {
  // 2. Nos conectamos usando las variables de entorno automáticas
  const client = await db.connect();
  
  try {
    // 3. Ejemplo de consulta (Cambia 'usuarios' por el nombre de tu tabla)
    const result = await client.sql`SELECT * FROM usuarios;`;
    console.log("Datos recuperados:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error en la base de datos:", error);
  } finally {
    // 4. Siempre cerramos la conexión
    client.release();
  }
}