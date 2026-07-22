import { MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import type { Tenant, WeekDay } from '@/types';
import { WhatsAppButton } from './WhatsAppButton';

const DAY_LABELS: Record<WeekDay, string> = {
  seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta',
  sex: 'Sexta', sab: 'Sábado', dom: 'Domingo',
};

function isOpenNow(tenant: Tenant): boolean {
  const days: WeekDay[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const today = days[new Date().getDay()];
  const hours = tenant.opening_hours[today];
  if (!hours || hours.closed) return false;
  const now = new Date();
  const [openH, openM] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= openH * 60 + openM && nowMinutes <= closeH * 60 + closeM;
}

export function Hero({ tenant }: { tenant: Tenant }) {
  const open = isOpenNow(tenant);

  return (
    <section className="relative">
      <div className="h-40 w-full overflow-hidden bg-surface-raised sm:h-56">
        {tenant.banner_url ? (
          <img src={tenant.banner_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-primary/30 to-brand-secondary/20" />
        )}
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <div className="-mt-6 flex flex-col gap-3 rounded-card bg-surface-raised p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div>
            {tenant.description && (
              <p className="mb-2 text-sm text-ink-muted">{tenant.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="h-3.5 w-3.5" />
                <span className={open ? 'text-emerald-500' : 'text-red-500'}>
                  {open ? 'Aberto agora' : 'Fechado agora'}
                </span>
              </span>
              {tenant.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {tenant.address}
                </span>
              )}
              {tenant.instagram_url && (
                <a
                  href={tenant.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="flex items-center gap-1 hover:text-ink"
                >
                  <Instagram className="h-3.5 w-3.5" /> Instagram
                </a>
              )}
              {tenant.facebook_url && (
                <a
                  href={tenant.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex items-center gap-1 hover:text-ink"
                >
                  <Facebook className="h-3.5 w-3.5" /> Facebook
                </a>
              )}
            </div>
          </div>

          {tenant.whatsapp_number && (
            <WhatsAppButton phone={tenant.whatsapp_number} label="Chamar no WhatsApp" />
          )}
        </div>
      </div>
    </section>
  );
}

export { DAY_LABELS };
