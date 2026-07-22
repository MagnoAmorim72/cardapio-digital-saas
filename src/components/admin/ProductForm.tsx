import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/utils/slugify';
import { uploadTenantAsset } from '@/services/storageService';
import type { Category, Product, ProductTag } from '@/types';
import { PRODUCT_TAG_LABELS } from '@/types';

export interface ProductFormValues {
  name: string;
  description: string;
  category_id: string;
  price: number;
  promo_price: number | null;
  prep_time_minutes: number | null;
  ingredients: string;
  tags: ProductTag[];
  is_available: boolean;
  is_featured: boolean;
  image_url: string;
}

interface ProductFormProps {
  tenantId: string;
  categories: Category[];
  initialProduct?: Product;
  onSubmit: (values: ProductFormValues & { slug: string }) => Promise<void>;
  onCancel: () => void;
}

const ALL_TAGS = Object.keys(PRODUCT_TAG_LABELS) as ProductTag[];

export function ProductForm({ tenantId, categories, initialProduct, onSubmit, onCancel }: ProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialProduct?.image_url ?? '');
  const [selectedTags, setSelectedTags] = useState<ProductTag[]>(initialProduct?.tags ?? []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    defaultValues: {
      name: initialProduct?.name ?? '',
      description: initialProduct?.description ?? '',
      category_id: initialProduct?.category_id ?? categories[0]?.id ?? '',
      price: initialProduct?.price ?? 0,
      promo_price: initialProduct?.promo_price ?? null,
      prep_time_minutes: initialProduct?.prep_time_minutes ?? null,
      ingredients: initialProduct?.ingredients?.join(', ') ?? '',
      is_available: initialProduct?.is_available ?? true,
      is_featured: initialProduct?.is_featured ?? false,
    },
  });

  function toggleTag(tag: ProductTag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadTenantAsset(tenantId, 'products', file);
      setImageUrl(url);
    } finally {
      setUploading(false);
    }
  }

  async function submit(values: ProductFormValues) {
    await onSubmit({
      ...values,
      slug: slugify(values.name),
      image_url: imageUrl,
      tags: selectedTags,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Input
        label="Nome do produto"
        {...register('name', { required: 'Informe o nome do produto.' })}
        error={errors.name?.message}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Descrição</label>
        <textarea
          {...register('description')}
          rows={3}
          className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Categoria</label>
        <select
          {...register('category_id', { required: true })}
          className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Preço (R$)"
          type="number"
          step="0.01"
          {...register('price', { required: true, valueAsNumber: true, min: 0 })}
          error={errors.price?.message}
        />
        <Input
          label="Preço promocional (R$)"
          type="number"
          step="0.01"
          {...register('promo_price', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Tempo de preparo (min)"
          type="number"
          {...register('prep_time_minutes', { valueAsNumber: true })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Foto do produto</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs text-ink-muted" />
          {uploading && <span className="text-xs text-ink-muted">Enviando...</span>}
        </div>
      </div>

      <Input
        label="Ingredientes (separados por vírgula)"
        {...register('ingredients')}
        placeholder="pão, carne, queijo, alface"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Etiquetas</label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className={
                selectedTags.includes(tag)
                  ? 'rounded-full bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white'
                  : 'rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted'
              }
            >
              {PRODUCT_TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" {...register('is_available')} className="h-4 w-4 rounded" />
          Disponível
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" {...register('is_featured')} className="h-4 w-4 rounded" />
          Destaque
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={isSubmitting}>Salvar produto</Button>
      </div>
    </form>
  );
}
