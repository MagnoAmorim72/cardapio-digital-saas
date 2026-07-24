import { MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import type { Tenant, WeekDay } from '@/types';
import { WhatsAppButton } from './WhatsAppButton';
import { BurgerIllustration } from './BurgerIllustration';
import { buildDoodlePatternDataUri } from '@/utils/doodlePattern';

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
    <section className="relative overflow-hidden border-b-4 border-ink/10">
      {tenant.banner_url ? (
        // Foto de banner real do estabelecimento tem sempre prioridade.
        <div className="h-40 w-full overflow-hidden sm:h-56">
          <img src={tenant.banner_url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        // Estado ilustrado (padrão para quem ainda não subiu um banner próprio).
        <div
          className="relative px-4 pb-10 pt-8 sm:pb-14 sm:pt-12"
          style={{
            backgroundColor: `rgb(${tenant.theme.secondary} / 0.16)`,
            backgroundImage: buildDoodlePatternDataUri(tenant.theme.secondary),
            backgroundSize: '120px 120px',
          }}
        >
          <div className="mx-auto grid max-w-3xl grid-cols-1 items-center gap-6 sm:grid-cols-2 sm:gap-4">
            <div>
              <span className="inline-block rounded-xl border-2 border-dashed border-ink/30 bg-surface/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                {tenant.description ? tenant.description.slice(0, 46) : 'Sabor de verdade, todo santo dia'}
              </span>
              <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-ink sm:text-5xl">
                {tenant.name}
              </h1>
            </div>
            <div className="flex justify-center sm:justify-end">
              <BurgerIllustration className="w-44 sm:w-56" />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4">
        <div className="-mt-6 flex flex-col gap-3 rounded-card border-2 border-ink/10 bg-surface-raised p-4 shadow-hard-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            {tenant.banner_url && tenant.description && (
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
