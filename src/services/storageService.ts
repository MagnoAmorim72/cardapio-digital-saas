import { supabase } from './supabaseClient';

const BUCKET = 'tenant-assets';

/**
 * Faz upload de uma imagem (logo, banner ou foto de produto) para o bucket
 * público do tenant e retorna a URL pública final.
 */
export async function uploadTenantAsset(
  tenantId: string,
  folder: 'logo' | 'banner' | 'products',
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${tenantId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
