import { useState } from 'react';
import { MapPin, LocateFixed, Loader2, CheckCircle2 } from 'lucide-react';
import { getCurrentPosition, reverseGeocode, buildGoogleMapsLink, type GeoCoords } from '@/utils/geolocation';

interface DeliveryAddressInputProps {
  address: string;
  onAddressChange: (address: string) => void;
  onLocationCaptured: (mapsLink: string | null) => void;
}

/**
 * Campo de endereço de entrega com opção de preencher automaticamente via
 * GPS do navegador. Ao capturar a localização, gera também um link do
 * Google Maps que é anexado à mensagem final do WhatsApp — o texto do
 * endereço continua editável mesmo depois de usar o GPS.
 */
export function DeliveryAddressInput({ address, onAddressChange, onLocationCaptured }: DeliveryAddressInputProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleUseLocation() {
    setStatus('loading');
    setError(null);
    try {
      const coords: GeoCoords = await getCurrentPosition();
      const [readableAddress] = await Promise.all([reverseGeocode(coords)]);
      onAddressChange(readableAddress);
      onLocationCaptured(buildGoogleMapsLink(coords));
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível obter sua localização.');
      setStatus('error');
    }
  }

  function handleManualEdit(value: string) {
    onAddressChange(value);
    // Se o cliente editar o endereço manualmente depois de usar o GPS,
    // mantemos o link do mapa (a localização captada continua válida).
  }

  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <label htmlFor="delivery-address" className="text-sm font-medium text-ink">
        Endereço de entrega
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="delivery-address"
            value={address}
            onChange={(e) => handleManualEdit(e.target.value)}
            placeholder="Rua, número, bairro..."
            className="w-full rounded-xl border border-ink/15 bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={status === 'loading'}
          aria-label="Usar minha localização atual"
          title="Usar minha localização atual"
          className="flex shrink-0 items-center justify-center rounded-xl border border-brand-primary/40 bg-brand-primary/10 px-3 text-brand-primary transition hover:bg-brand-primary/20 disabled:opacity-60"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
        </button>
      </div>
      {status === 'success' && (
        <p className="text-xs text-emerald-500">Localização capturada — a mensagem vai incluir um link do mapa.</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
