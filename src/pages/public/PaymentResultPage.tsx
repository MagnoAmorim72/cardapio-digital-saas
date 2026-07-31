import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ResultStatus = 'success' | 'pending' | 'error';

const CONTENT: Record<ResultStatus, { icon: typeof CheckCircle2; color: string; title: string; message: string }> = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    title: 'Pagamento aprovado!',
    message: 'Recebemos seu pagamento e o estabelecimento já foi avisado do seu pedido.',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-500',
    title: 'Pagamento em análise',
    message: 'Assim que o pagamento for confirmado, o estabelecimento vai receber seu pedido automaticamente.',
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    title: 'Pagamento não concluído',
    message: 'Algo impediu a conclusão do pagamento. Você pode voltar ao cardápio e tentar novamente.',
  },
};

export function PaymentResultPage({ status }: { status: ResultStatus }) {
  const { icon: Icon, color, title, message } = CONTENT[status];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4 text-center">
      <Icon className={`h-16 w-16 ${color}`} />
      <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
      <p className="max-w-sm text-sm text-ink-muted">{message}</p>
      <Link to="/">
        <Button>Voltar ao cardápio</Button>
      </Link>
    </div>
  );
}
