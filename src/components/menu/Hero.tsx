import { MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import type { Tenant, WeekDay } from '@/types';
import { WhatsAppButton } from './WhatsAppButton';

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
    <section className="mx-auto max-w-3xl px-4 pt-4">
      {/* Banner: foto real do estabelecimento em destaque; sem foto cadastrada,
          usamos um gradiente suave nas cores da marca — discreto e elegante,
          nunca "cartunizado". */}
      <div className="overflow-hidden rounded-3xl shadow-elevated">
        {tenant.banner_url ? (
          <img
            src={tenant.banner_url}
            alt=""
            className="h-44 w-full object-cover sm:h-64"
          />
        ) : (
          <div
            className="h-44 w-full sm:h-64"
            style={{
              backgroundImage: `linear-gradient(135deg, rgb(${tenant.theme.primary} / 0.92), rgb(${tenant.theme.secondary} / 0.85))`,
            }}
          />
        )}
      </div>

      {/* Cartão de informações, levemente sobreposto ao banner. */}
      <div className="relative z-10 -mt-8 flex flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-elevated sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-display text-lg font-bold text-ink sm:text-xl">{tenant.name}</h1>
          {tenant.description && (
            <p className="mb-2 text-sm text-ink-muted">{tenant.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span className={open ? 'text-emerald-600' : 'text-red-500'}>
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
    </section>
  );
}
