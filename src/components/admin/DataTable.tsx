import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

/** Tabela genérica e reutilizável para as telas administrativas (produtos, categorias, cupons, pedidos). */
export function DataTable<T>({ columns, rows, keyExtractor, emptyMessage }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-card bg-surface-raised p-8 text-center text-sm text-ink-muted">
        {emptyMessage ?? 'Nenhum registro encontrado.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card bg-surface-raised shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-muted">
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyExtractor(row)} className="border-b border-ink/5 last:border-0 hover:bg-surface/50">
              {columns.map((col) => (
                <td key={col.header} className={col.className ?? 'px-4 py-3 text-ink'}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
