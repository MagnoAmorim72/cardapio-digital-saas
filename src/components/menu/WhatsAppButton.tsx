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
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
