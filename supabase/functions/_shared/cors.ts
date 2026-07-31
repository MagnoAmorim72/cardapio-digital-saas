// Cabeçalhos CORS compartilhados pelas Edge Functions públicas (chamadas
// diretamente do navegador do cliente final, de qualquer domínio).
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
