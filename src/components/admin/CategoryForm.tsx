import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { slugify } from '@/utils/slugify';
import type { Category } from '@/types';

export interface CategoryFormValues {
  name: string;
  icon: string;
  is_featured: boolean;
  is_active: boolean;
}

interface CategoryFormProps {
  initialCategory?: Category;
  onSubmit: (values: CategoryFormValues & { slug: string }) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initialCategory, onSubmit, onCancel }: CategoryFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
    defaultValues: {
      name: initialCategory?.name ?? '',
      icon: initialCategory?.icon ?? 'UtensilsCrossed',
      is_featured: initialCategory?.is_featured ?? false,
      is_active: initialCategory?.is_active ?? true,
    },
  });

  async function submit(values: CategoryFormValues) {
    await onSubmit({ ...values, slug: slugify(values.name) });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Input
        label="Nome da categoria"
        {...register('name', { required: 'Informe o nome da categoria.' })}
        error={errors.name?.message}
      />
      <Input
        label="Ícone (nome do lucide-react)"
        {...register('icon')}
        placeholder="Ex: Pizza, Beef, CupSoda, IceCreamCone"
      />
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" {...register('is_featured')} className="h-4 w-4 rounded" />
          Categoria em destaque
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded" />
          Ativa
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={isSubmitting}>Salvar categoria</Button>
      </div>
    </form>
  );
}
