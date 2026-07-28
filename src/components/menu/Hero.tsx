import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Instagram, Facebook, Clock, Flame } from 'lucide-react';
import type { Tenant, WeekDay, Product, Banner } from '@/types';
import { WhatsAppButton } from './WhatsAppButton';
import { getShowcaseProducts } from '@/services/productService';
import { listActiveBanners } from '@/services/bannerService';
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

const AUTO_ROTATE_MS = 5000;

/**
 * Um "slide" do carrossel pode ser um banner livre (campanha cadastrada
 * no admin, sem produto vinculado) ou a vitrine automática de um produto
 * em destaque/promoção. Os dois tipos se misturam no mesmo carrossel.
 */
type HeroSlide =
  | { kind: 'banner'; id: string; imageUrl: string; title: string | null; subtitle: string | null }
  | { kind: 'product'; id: string; product: Product };

export function Hero({ tenant }: { tenant: Tenant }) {
  const open = isOpenNow(tenant);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showcaseProducts, setShowcaseProducts] = useState<Product[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([listActiveBanners(tenant.id), getShowcaseProducts(tenant.id)]).then(
      ([activeBanners, products]) => {
        if (!active) return;
        setBanners(activeBanners);
        setShowcaseProducts(products);
      }
    );
    return () => {
      active = false;
    };
  }, [tenant.id]);

  const slides: HeroSlide[] = useMemo(() => {
    const result: HeroSlide[] = [];
    // Foto de banner "clássica" cadastrada em Configurações continua valendo,
    // como o primeiro slide fixo, para quem já a configurou antes.
    if (tenant.banner_url) {
      result.push({ kind: 'banner', id: 'legacy-banner', imageUrl: tenant.banner_url, title: null, subtitle: null });
    }
    banners.forEach((b) =>
      result.push({ kind: 'banner', id: b.id, imageUrl: b.image_url, title: b.title, subtitle: b.subtitle })
    );
    showcaseProducts.forEach((p) => result.push({ kind: 'product', id: p.id, product: p }));
    return result;
  }, [tenant.banner_url, banners, showcaseProducts]);

  // Avança o carrossel sozinho a cada alguns segundos, quando há mais de um slide.
  useEffect(() => {
    setSlideIndex(0);
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[slideIndex];

  return (
    <section className="mx-auto max-w-3xl px-4 pt-4">
      <div className="relative overflow-hidden rounded-3xl shadow-elevated">
        {current ? (
          <div className="relative h-44 w-full sm:h-64">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {current.kind === 'product' ? (
                  <ProductSlideContent product={current.product} />
                ) : (
                  <BannerSlideContent
                    imageUrl={current.imageUrl}
                    title={current.title}
                    subtitle={current.subtitle}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {slides.length > 1 && (
              <div className="absolute right-4 top-4 flex gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSlideIndex(i)}
                    aria-label={`Ver slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === slideIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Nenhum banner, campanha ou produto com foto ainda: gradiente discreto.
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

/** Slide de produto em destaque/promoção: foto + selo + nome + preço. */
function ProductSlideContent({ product }: { product: Product }) {
  const price = product.promo_price ?? product.price;
  return (
    <>
      <img src={product.image_url!} alt={product.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      {/* bottom-8 (não bottom-0): deixa folga para o cartão de informações,
          que se sobrepõe 2rem (-mt-8) por cima do banner. */}
      <div className="absolute inset-x-0 bottom-8 flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            <Flame className="h-3 w-3" />
            {product.is_featured ? 'Destaque da casa' : 'Oferta especial'}
          </span>
          <p className="truncate font-display text-lg font-bold leading-tight text-white sm:text-xl">
            {product.name}
          </p>
        </div>
        <span className="shrink-0 rounded-xl bg-white px-3 py-2 text-right shadow-sm">
          <span className="block font-mono text-base font-bold text-ink sm:text-lg">
            {formatCurrency(price)}
          </span>
        </span>
      </div>
    </>
  );
}

/** Slide de banner livre (campanha cadastrada no admin, sem produto vinculado). */
function BannerSlideContent({
  imageUrl,
  title,
  subtitle,
}: {
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
}) {
  const hasText = Boolean(title || subtitle);
  return (
    <>
      <img src={imageUrl} alt={title ?? ''} className="h-full w-full object-cover" />
      {hasText && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-8 px-4">
            {title && (
              <p className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                {title}
              </p>
            )}
            {subtitle && <p className="text-sm text-white/90">{subtitle}</p>}
          </div>
        </>
      )}
    </>
  );
}
