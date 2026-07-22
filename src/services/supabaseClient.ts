import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Falha rápida e explícita: evita erros confusos de rede mais adiante.
  throw new Error(
    'Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. Copie .env.example para .env e preencha.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // keepalive garante que a requisição termine de ser enviada mesmo que a
    // página seja trocada logo em seguida (ex: checkout no celular, que
    // navega para o WhatsApp assim que o pedido é salvo — sem isso, alguns
    // navegadores mobile cortam a requisição no meio do caminho).
    fetch: (input, init) => fetch(input, { ...init, keepalive: true }),
  },
});
