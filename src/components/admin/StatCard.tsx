import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-card bg-surface-raised p-4 shadow-card">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="font-display text-xl font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}
