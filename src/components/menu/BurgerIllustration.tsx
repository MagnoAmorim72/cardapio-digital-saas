/**
 * Ilustração original de hambúrguer em SVG, estilo retrô/desenho de linha
 * grossa — usada como elemento decorativo no herói quando o estabelecimento
 * ainda não cadastrou uma foto de banner própria. Sempre que houver
 * `banner_url`, a foto real do estabelecimento tem prioridade (ver Hero.tsx).
 */
export function BurgerIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustração de hambúrguer"
    >
      {/* sombra dura */}
      <ellipse cx="184" cy="284" rx="130" ry="14" fill="rgb(var(--ink))" opacity="0.12" />

      {/* pão de baixo */}
      <path
        d="M50 232 Q50 262 90 262 H270 Q310 262 310 232 V222 H50 Z"
        fill="#E3A24B"
        stroke="rgb(var(--ink))"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* alface */}
      <path
        d="M46 220 Q60 196 84 214 Q100 192 122 212 Q140 190 162 213 Q182 190 204 213 Q224 190 246 212 Q268 192 284 214 Q306 198 316 220 L314 228 H48 Z"
        fill="#8BC34A"
        stroke="rgb(var(--ink))"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* queijo */}
      <path
        d="M56 200 L308 200 L286 178 H78 Z"
        fill="#F6C445"
        stroke="rgb(var(--ink))"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* carne */}
      <path
        d="M58 178 Q50 158 78 152 H288 Q314 158 306 178 Q310 190 288 192 H78 Q54 190 58 178 Z"
        fill="#8B5A34"
        stroke="rgb(var(--ink))"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="110" cy="170" r="4" fill="rgb(var(--ink))" opacity="0.35" />
      <circle cx="190" cy="166" r="4" fill="rgb(var(--ink))" opacity="0.35" />
      <circle cx="250" cy="172" r="4" fill="rgb(var(--ink))" opacity="0.35" />

      {/* tomate */}
      <path
        d="M62 150 H302 L292 132 H72 Z"
        fill="#E5533D"
        stroke="rgb(var(--ink))"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* pão de cima */}
      <path
        d="M52 132 Q52 56 184 50 Q316 56 316 132 Z"
        fill="#F0A63C"
        stroke="rgb(var(--ink))"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* gergelim */}
      <ellipse cx="140" cy="88" rx="6" ry="9" fill="rgb(var(--surface))" transform="rotate(-15 140 88)" />
      <ellipse cx="184" cy="72" rx="6" ry="9" fill="rgb(var(--surface))" />
      <ellipse cx="228" cy="90" rx="6" ry="9" fill="rgb(var(--surface))" transform="rotate(15 228 90)" />
      <ellipse cx="162" cy="108" rx="6" ry="9" fill="rgb(var(--surface))" transform="rotate(-10 162 108)" />
      <ellipse cx="206" cy="108" rx="6" ry="9" fill="rgb(var(--surface))" transform="rotate(10 206 108)" />
    </svg>
  );
}
