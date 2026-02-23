// 1. Importamos el cliente de Supabase
const { createClient } = require('@supabase/supabase-js');

// 2. Configuramos la conexión con las variables de entorno que pusiste en Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Función para obtener los productos del inventario
async function ejecutarConsulta() {
  try {
    // Consultamos la tabla 'productos' que acabamos de crear en Supabase
    const { data, error } = await supabase
      .from('productos')
      .select('*');

    if (error) {
      throw error;
    }

    console.log("Datos recuperados de Supabase:", data);
    return data; // Estos son los productos que se mostrarán en tu tabla
  } catch (error) {
    console.error("Error conectando con Supabase:", error.message);
    return [];
  }
}
