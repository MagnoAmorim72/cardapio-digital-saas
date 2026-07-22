import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTenant } from '@/hooks/useTenant';
import { updateTenant } from '@/services/tenantService';
import { uploadTenantAsset } from '@/services/storageService';
import type { OpeningHours, WeekDay } from '@/types';

interface SettingsFormValues {
  name: string;
  description: string;
  whatsapp_number: string;
  pix_key: string;
  address: string;
  instagram_url: string;
  facebook_url: string;
  delivery_fee: number;
  min_order_value: number;
  brand_primary: string;
  brand_secondary: string;
}

const DAY_ORDER: WeekDay[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
const DAY_LABELS: Record<WeekDay, string> = {
  seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado', dom: 'Domingo',
};

export function SettingsPage() {
  const { tenant, reload } = useTenant();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [hours, setHours] = useState<OpeningHours | null>(tenant?.opening_hours ?? null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm<SettingsFormValues>({
    defaultValues: {
      name: tenant?.name ?? '',
      description: tenant?.description ?? '',
      whatsapp_number: tenant?.whatsapp_number ?? '',
      pix_key: tenant?.pix_key ?? '',
      address: tenant?.address ?? '',
      instagram_url: tenant?.instagram_url ?? '',
      facebook_url: tenant?.facebook_url ?? '',
      delivery_fee: tenant?.delivery_fee ?? 0,
      min_order_value: tenant?.min_order_value ?? 0,
      brand_primary: tenant?.theme.primary ?? '255 90 31',
      brand_secondary: tenant?.theme.secondary ?? '255 197 61',
    },
  });

  if (!tenant || !hours) return null;

  function updateDay(day: WeekDay, patch: Partial<OpeningHours[WeekDay]>) {
    setHours((prev) => (prev ? { ...prev, [day]: { ...prev[day], ...patch } } : prev));
  }

  async function onSubmit(values: SettingsFormValues) {
    if (!tenant) return;
    setSaving(true);
    try {
      let logo_url = tenant.logo_url;
      let banner_url = tenant.banner_url;
      if (logoFile) logo_url = await uploadTenantAsset(tenant.id, 'logo', logoFile);
      if (bannerFile) banner_url = await uploadTenantAsset(tenant.id, 'banner', bannerFile);

      await updateTenant(tenant.id, {
        name: values.name,
        description: values.description,
        whatsapp_number: values.whatsapp_number,
        pix_key: values.pix_key || null,
        address: values.address,
        instagram_url: values.instagram_url,
        facebook_url: values.facebook_url,
        delivery_fee: Number(values.delivery_fee),
        min_order_value: Number(values.min_order_value),
        logo_url,
        banner_url,
        opening_hours: hours!,
        theme: { ...tenant.theme, primary: values.brand_primary, secondary: values.brand_secondary },
      });
      await reload();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">Configurações</h1>
      <p className="mb-6 text-sm text-ink-muted">Personalize a identidade e as regras do seu cardápio.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <section className="rounded-card bg-surface-raised p-5 shadow-card">
          <h2 className="mb-4 font-display text-base font-bold text-ink">Identidade</h2>
          <div className="flex flex-col gap-4">
            <Input label="Nome do estabelecimento" {...register('name', { required: true })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Descrição</label>
              <textarea
                {...register('description')}
                rows={2}
                className="rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="text-xs text-ink-muted" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Banner</label>
                <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} className="text-xs text-ink-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cor primária (R G B)" {...register('brand_primary')} placeholder="255 90 31" />
              <Input label="Cor secundária (R G B)" {...register('brand_secondary')} placeholder="255 197 61" />
            </div>
          </div>
        </section>

        <section className="rounded-card bg-surface-raised p-5 shadow-card">
          <h2 className="mb-4 font-display text-base font-bold text-ink">Contato e entrega</h2>
          <div className="flex flex-col gap-4">
            <Input label="WhatsApp (com DDI e DDD, ex: 5582999999999)" {...register('whatsapp_number')} />
            <Input
              label="Chave Pix (CPF, CNPJ, e-mail, telefone ou chave aleatória)"
              {...register('pix_key')}
              placeholder="Deixe em branco para não mostrar Pix no checkout"
            />
            <Input label="Endereço" {...register('address')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Instagram (URL)" {...register('instagram_url')} />
              <Input label="Facebook (URL)" {...register('facebook_url')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Taxa de entrega (R$)" type="number" step="0.01" {...register('delivery_fee', { valueAsNumber: true })} />
              <Input label="Pedido mínimo (R$)" type="number" step="0.01" {...register('min_order_value', { valueAsNumber: true })} />
            </div>
          </div>
        </section>

        <section className="rounded-card bg-surface-raised p-5 shadow-card">
          <h2 className="mb-4 font-display text-base font-bold text-ink">Horário de funcionamento</h2>
          <div className="flex flex-col gap-2">
            {DAY_ORDER.map((day) => (
              <div key={day} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-ink-muted">{DAY_LABELS[day]}</span>
                <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <input
                    type="checkbox"
                    checked={!hours[day].closed}
                    onChange={(e) => updateDay(day, { closed: !e.target.checked })}
                  />
                  Aberto
                </label>
                {!hours[day].closed && (
                  <>
                    <input
                      type="time"
                      value={hours[day].open}
                      onChange={(e) => updateDay(day, { open: e.target.value })}
                      className="rounded-lg border border-ink/15 bg-surface px-2 py-1 text-xs"
                    />
                    <span className="text-ink-muted">até</span>
                    <input
                      type="time"
                      value={hours[day].close}
                      onChange={(e) => updateDay(day, { close: e.target.value })}
                      className="rounded-lg border border-ink/15 bg-surface px-2 py-1 text-xs"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <Button type="submit" isLoading={saving} className="w-fit">
          Salvar configurações
        </Button>
      </form>
    </div>
  );
}
