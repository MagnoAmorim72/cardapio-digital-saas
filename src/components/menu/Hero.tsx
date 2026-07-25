import { useEffect, useState } from 'react';
import { MapPin, Instagram, Facebook, Clock, Flame } from 'lucide-react';
import type { Tenant, WeekDay, Product } from '@/types';
import { WhatsAppButton } from './WhatsAppButton';
import { getShowcaseProduct } from '@/services/productService';
import { formatCurrency } from '@/utils/formatCurrency';

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
  const [showcaseProduct, setShowcaseProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Só precisamos buscar um produto-vitrine quando não há banner próprio.
    if (tenant.banner_url) return;
    let active = true;
    getShowcaseProduct(tenant.id).then((product) => {
      if (active) setShowcaseProduct(product);
    });
    return () => {
      active = false;
    };
  }, [tenant.id, tenant.banner_url]);

  const showcasePrice = showcaseProduct
    ? showcaseProduct.promo_price ?? showcaseProduct.price
    : null;

  return (
    <section className="mx-auto max-w-3xl px-4 pt-4">
      {/* Prioridade 1: foto de banner cadastrada manualmente pelo estabelecimento.
          Prioridade 2: vitrine automática do produto em destaque/promoção.
          Prioridade 3 (loja ainda sem fotos): gradiente discreto nas cores da marca. */}
      <div className="relative overflow-hidden rounded-3xl shadow-elevated">
        {tenant.banner_url ? (
          <img src={tenant.banner_url} alt="" className="h-44 w-full object-cover sm:h-64" />
        ) : showcaseProduct?.image_url ? (
          <div className="relative h-44 w-full sm:h-64">
            <img
              src={showcaseProduct.image_url}
              alt={showcaseProduct.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
              <div>
                <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Flame className="h-3 w-3" />
                  {showcaseProduct.is_featured ? 'Destaque da casa' : 'Oferta especial'}
                </span>
                <p className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                  {showcaseProduct.name}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                <span className="block font-mono text-base font-bold text-ink sm:text-lg">
                  {formatCurrency(showcasePrice!)}
                </span>
              </span>
            </div>
          </div>
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
