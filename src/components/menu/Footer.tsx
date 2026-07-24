import type { Tenant, WeekDay } from '@/types';

const DAY_ORDER: WeekDay[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
const DAY_LABELS: Record<WeekDay, string> = {
  seg: 'Segunda-feira', ter: 'Terça-feira', qua: 'Quarta-feira', qui: 'Quinta-feira',
  sex: 'Sexta-feira', sab: 'Sábado', dom: 'Domingo',
};

export function Footer({ tenant }: { tenant: Tenant }) {
  return (
    <footer className="mt-10 border-t-4 border-ink/10 bg-surface-raised/50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h3 className="mb-3 font-display text-base font-semibold uppercase tracking-wide text-ink">
          Horário de funcionamento
        </h3>
        <ul className="mb-6 grid grid-cols-1 gap-1 text-xs text-ink-muted sm:grid-cols-2">
          {DAY_ORDER.map((day) => {
            const hours = tenant.opening_hours[day];
            return (
              <li key={day} className="flex justify-between border-b border-dashed border-ink/10 py-1">
                <span>{DAY_LABELS[day]}</span>
                <span>{hours?.closed ? 'Fechado' : `${hours?.open} – ${hours?.close}`}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-center text-[11px] text-ink-muted">
          Cardápio digital por <span className="font-semibold">{tenant.name}</span> · Powered by Cardápio Digital SaaS
        </p>
      </div>
    </footer>
  );
}
