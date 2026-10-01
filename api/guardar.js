import { createClient } from '@supabase/supabase-js';

const TABLA = 'nombre_de_tu_tabla';   // <-- poné el nombre de tu tabla
const COLUMNA = 'nombre_de_columna';  // <-- poné la columna donde va el texto

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { texto } = req.body || {};
  if (!texto) {
    return res.status(400).json({ error: 'Falta el texto' });
  }

  const { data, error } = await supabase
    .from(TABLA)
    .insert({ [COLUMNA]: texto })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ ok: true, guardado: data });
}
