import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadTenantAsset } from '@/services/storageService';
import type { Banner } from '@/types';

export interface BannerFormValues {
  title: string;
  subtitle: string;
  is_active: boolean;
}

interface BannerFormProps {
  tenantId: string;
  initialBanner?: Banner;
  onSubmit: (values: BannerFormValues & { image_url: string }) => Promise<void>;
  onCancel: () => void;
}

export function BannerForm({ tenantId, initialBanner, onSubmit, onCancel }: BannerFormProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialBanner?.image_url ?? '');
  const [imageError, setImageError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<BannerFormValues>({
    defaultValues: {
      title: initialBanner?.title ?? '',
      subtitle: initialBanner?.subtitle ?? '',
      is_active: initialBanner?.is_active ?? true,
    },
  });

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImageError(null);
    try {
      const url = await uploadTenantAsset(tenantId, 'banner', file);
      setImageUrl(url);
    } finally {
      setUploading(false);
    }
  }

  async function submit(values: BannerFormValues) {
    if (!imageUrl) {
      setImageError('Envie uma imagem para o banner.');
      return;
    }
    await onSubmit({ ...values, image_url: imageUrl });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Imagem do banner</label>
        {imageUrl && (
          <img src={imageUrl} alt="" className="mb-1 h-32 w-full rounded-xl object-cover" />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs text-ink-muted" />
        {uploading && <span className="text-xs text-ink-muted">Enviando...</span>}
        {imageError && <span className="text-xs text-red-500">{imageError}</span>}
      </div>

      <Input
        label="Título (opcional)"
        {...register('title')}
        placeholder="Ex: Dia Mundial da Pizza 🍕"
      />
      <Input
        label="Subtítulo (opcional)"
        {...register('subtitle')}
        placeholder="Ex: Só hoje, todas as pizzas com 20% off"
      />

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded" />
        Ativo (aparece no carrossel do cardápio)
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={isSubmitting || uploading}>Salvar banner</Button>
      </div>
    </form>
  );
}
