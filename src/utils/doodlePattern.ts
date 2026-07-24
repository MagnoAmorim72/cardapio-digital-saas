/**
 * Gera um padrão repetível simples (pontos + ondulações), como uma textura
 * decorativa sutil de fundo — usado no herói quando não há banner próprio.
 * É um SVG gerado em runtime (data URI), não uma imagem externa: leve e
 * sem dependência de nenhum arquivo/asset de terceiros.
 */
export function buildDoodlePatternDataUri(colorRgb: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <g fill="none" stroke="rgb(${colorRgb})" stroke-width="2.5" stroke-linecap="round" opacity="0.16">
        <circle cx="20" cy="20" r="4" fill="rgb(${colorRgb})" stroke="none" />
        <circle cx="95" cy="35" r="3" fill="rgb(${colorRgb})" stroke="none" />
        <circle cx="60" cy="90" r="4" fill="rgb(${colorRgb})" stroke="none" />
        <path d="M40 15 q8 10 0 20 q-8 10 0 20" />
        <path d="M90 70 q8 10 0 20 q-8 10 0 20" />
        <path d="M10 60 q8 8 16 0" />
        <path d="M70 15 q8 8 16 0" />
      </g>
    </svg>
  `.trim();
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  return `url("data:image/svg+xml,${encoded}")`;
}
