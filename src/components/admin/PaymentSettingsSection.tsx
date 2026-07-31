import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTenant } from '@/hooks/useTenant';
import { getPaymentSettings, savePaymentSettings } from '@/services/paymentService';
import { updateTenant } from '@/services/tenantService';

interface PaymentSettingsFormValues {
  mp_access_token: string;
  mp_public_key: string;
  is_test_mode: boolean;
  card_payment_enabled: boolean;
}

/**
 * Configuração das credenciais do Mercado Pago. Fica separada do formulário
 * principal de Configurações porque grava numa tabela protegida à parte
 * (tenant_payment_settings), nunca visível publicamente.
 */
export function PaymentSettingsSection() {
  const { tenant, reload } = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset } = useForm<PaymentSettingsFormValues>({
    defaultValues: {
      mp_access_token: '',
      mp_public_key: '',
      is_test_mode: true,
      card_payment_enabled: tenant?.card_payment_enabled ?? false,
    },
  });

  useEffect(() => {
    if (!tenant) return;
    getPaymentSettings(tenant.id)
      .then((settings) => {
        reset({
          mp_access_token: settings?.mp_access_token ?? '',
          mp_public_key: settings?.mp_public_key ?? '',
          is_test_mode: settings?.is_test_mode ?? true,
          card_payment_enabled: tenant.card_payment_enabled,
        });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  async function onSubmit(values: PaymentSettingsFormValues) {
    if (!tenant) return;
    setSaving(true);
    setSaved(false);
    try {
      await savePaymentSettings(tenant.id, {
        mp_access_token: values.mp_access_token.trim(),
        mp_public_key: values.mp_public_key.trim(),
        is_test_mode: values.is_test_mode,
      });
      await updateTenant(tenant.id, { card_payment_enabled: values.card_payment_enabled });
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (!tenant) return null;

  return (
    <section className="rounded-card bg-surface-raised p-5 shadow-card">
      <div className="mb-1 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-brand-primary" />
        <h2 className="font-display text-base font-bold text-ink">Pagamento com cartão (Mercado Pago)</h2>
      </div>
      <p className="mb-4 text-xs text-ink-muted">
        As credenciais ficam guardadas de forma protegida — nunca são expostas no cardápio público, só a
        Edge Function do servidor tem acesso a elas.
      </p>

      {loading ? (
        <p className="text-sm text-ink-muted">Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Access Token"
            type="password"
            autoComplete="off"
            {...register('mp_access_token')}
            placeholder="Cole aqui o Access Token do painel de desenvolvedores"
          />
          <Input
            label="Public Key (opcional)"
            {...register('mp_public_key')}
            placeholder="Não é segredo, mas fica guardada junto por conveniência"
          />

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" {...register('is_test_mode')} className="h-4 w-4 rounded" />
            Usar credenciais de teste (recomendado até validar tudo)
          </label>

          <label className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm font-medium text-emerald-700">
            <input type="checkbox" {...register('card_payment_enabled')} className="h-4 w-4 rounded" />
            <ShieldCheck className="h-4 w-4" />
            Mostrar "Pagar com cartão" no cardápio
          </label>

          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={saving} className="w-fit">
              Salvar credenciais
            </Button>
            {saved && <span className="text-xs font-medium text-emerald-600">Salvo com sucesso!</span>}
          </div>
        </form>
      )}
    </section>
  );
}
