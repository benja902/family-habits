/**
 * Cliente de Supabase para el Panel Familiar de Hábitos y Recompensas.
 *
 * Esta instancia de Supabase maneja todas las operaciones de base de datos:
 * - Autenticación custom con PIN (sin Supabase Auth nativo)
 * - Consultas a todas las tablas del sistema (usuarios, hábitos, puntos, etc.)
 * - Funciones y triggers automáticos para cálculo de puntos
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables de entorno de Supabase no configuradas correctamente');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;