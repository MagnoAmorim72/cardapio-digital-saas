/**
 * Gera o payload "Pix Copia e Cola" no formato EMV® QR Code definido pelo
 * Banco Central (BR Code). Implementação 100% client-side, sem depender de
 * nenhuma API paga — a chave Pix cadastrada pelo estabelecimento já é
 * suficiente para montar um código válido, com valor e nome preenchidos.
 *
 * Referência do padrão: manual "BR Code" do Banco Central do Brasil.
 */

interface PixPayloadParams {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
}

function field(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/** Remove acentos/caracteres especiais e limita o tamanho (exigência do padrão BR Code). */
function sanitize(text: string, maxLength: number): string {
  const clean = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
  return (clean || 'ESTABELECIMENTO').slice(0, maxLength);
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) — checksum exigido no final do payload. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixPayload({ key, merchantName, merchantCity, amount, txid }: PixPayloadParams): string {
  const merchantAccountInfo = field('26', field('00', 'br.gov.bcb.pix') + field('01', key.trim()));
  const amountField = amount && amount > 0 ? field('54', amount.toFixed(2)) : '';
  const additionalData = field('62', field('05', (txid && txid.trim()) || '***'));

  const payloadWithoutCrc =
    field('00', '01') + // Payload Format Indicator
    field('01', '11') + // Point of Initiation Method (11 = estático/reutilizável)
    merchantAccountInfo +
    field('52', '0000') + // Merchant Category Code
    field('53', '986') + // Moeda: Real (BRL)
    amountField +
    field('58', 'BR') +
    field('59', sanitize(merchantName, 25)) +
    field('60', sanitize(merchantCity, 15)) +
    additionalData +
    '6304'; // ID + tamanho do CRC (o valor em si vem logo em seguida)

  return payloadWithoutCrc + crc16(payloadWithoutCrc);
}
