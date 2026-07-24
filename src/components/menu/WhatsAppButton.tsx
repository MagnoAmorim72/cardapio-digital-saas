import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  label?: string;
  message?: string;
}

export function WhatsAppButton({ phone, label = 'Pedir no WhatsApp', message }: WhatsAppButtonProps) {
  const digits = phone.replace(/\D/g, '');
  const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-hard-sm transition hover:brightness-105 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
