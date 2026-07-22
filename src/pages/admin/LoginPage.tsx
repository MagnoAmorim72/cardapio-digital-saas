import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UtensilsCrossed } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-card bg-surface-raised p-6 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary text-white">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <h1 className="font-display text-lg font-bold text-ink">Painel Administrativo</h1>
          <p className="text-xs text-ink-muted">Entre com sua conta para gerenciar o cardápio</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            {...register('email', { required: 'Informe seu e-mail.' })}
            error={errors.email?.message}
          />
          <Input
            label="Senha"
            type="password"
            {...register('password', { required: 'Informe sua senha.' })}
            error={errors.password?.message}
          />
          {serverError && <p className="text-sm text-red-500">{serverError}</p>}
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
