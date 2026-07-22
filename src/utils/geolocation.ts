/**
 * Captura a localização GPS do navegador e converte em um endereço legível,
 * usando o Nominatim (OpenStreetMap) — serviço gratuito de geocodificação
 * reversa, sem necessidade de chave de API.
 *
 * Requer contexto seguro (HTTPS ou localhost): em produção (Vercel/Cloudflare)
 * funciona normalmente; ao testar pelo IP da rede local (http://192.168.x.x)
 * o navegador bloqueia o acesso ao GPS por segurança.
 */

export interface GeoCoords {
  lat: number;
  lng: number;
}

export class GeolocationError extends Error {}

export function getCurrentPosition(): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeolocationError('Seu navegador não suporta geolocalização.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new GeolocationError('Permissão de localização negada. Você pode digitar o endereço manualmente.'));
        } else if (error.code === error.TIMEOUT) {
          reject(new GeolocationError('Tempo esgotado ao buscar sua localização. Tente novamente.'));
        } else {
          reject(new GeolocationError('Não foi possível obter sua localização. Verifique se o GPS está ativado.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/** Converte coordenadas em um endereço legível (rua, bairro, cidade). */
export async function reverseGeocode({ lat, lng }: GeoCoords): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new GeolocationError('Não foi possível identificar o endereço a partir da localização.');
  const data = await response.json();
  return data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function buildGoogleMapsLink({ lat, lng }: GeoCoords): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
