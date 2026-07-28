/**
 * services/supabase.js
 * Instancia \u00FAnica del cliente de Supabase con el service role key.
 * Usar SOLO en el backend (nunca exponer esta key al frontend).
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
