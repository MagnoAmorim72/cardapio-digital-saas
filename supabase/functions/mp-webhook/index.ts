// Edge Function: mp-webhook
//
// Recebe as notificações automáticas do Mercado Pago quando o status de um
// pagamento muda (aprovado, recusado, etc.) e atualiza o pedido no banco
// de acordo — é isso que faz o painel admin mudar sozinho, sem ninguém
// precisar confirmar nada manualmente.
//
// O Mercado Pago não sabe (nem precisa saber) qual dos nossos vários
// estabelecimentos gerou esse pagamento — por isso a URL de notificação é
// criada, lá no create-payment, já com "?tenant_id=..." no final, e é
// assim que sabemos de quem é a credencial certa para consultar o pagamento.

import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenant_id');

    // Formatos possíveis de notificação do Mercado Pago:
    // novo:  ?data.id=123&type=payment       |  antigo: ?id=123&topic=payment
    const paymentId = url.searchParams.get('data.id') ?? url.searchParams.get('id');
    const topic = url.searchParams.get('type') ?? url.searchParams.get('topic');

    // Só nos interessam notificações de pagamento; qualquer outra coisa é
    // apenas confirmada com 200 OK para o Mercado Pago parar de reenviar.
    if (!tenantId || !paymentId || topic !== 'payment') {
      return new Response('ok', { status: 200 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: paymentSettings } = await supabase
      .from('tenant_payment_settings')
      .select('mp_access_token')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (!paymentSettings?.mp_access_token) {
      // Sem credencial para consultar — nada a fazer, mas confirma o recebimento.
      return new Response('ok', { status: 200 });
    }

    // Consulta o pagamento de verdade na API do Mercado Pago (nunca confiamos
    // cegamente no conteúdo do webhook — sempre confirmamos direto na fonte).
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${paymentSettings.mp_access_token}` },
    });

    if (!paymentRes.ok) {
      console.error('Falha ao consultar pagamento no Mercado Pago:', await paymentRes.text());
      return new Response('ok', { status: 200 });
    }

    const payment = await paymentRes.json();
    const orderId = payment.external_reference as string | undefined;
    if (!orderId) return new Response('ok', { status: 200 });

    const statusMap: Record<string, { payment_status: string; status?: string }> = {
      approved: { payment_status: 'approved', status: 'confirmed' },
      rejected: { payment_status: 'rejected', status: 'cancelled' },
      cancelled: { payment_status: 'rejected', status: 'cancelled' },
      refunded: { payment_status: 'rejected', status: 'cancelled' },
      pending: { payment_status: 'pending' },
      in_process: { payment_status: 'pending' },
    };
    const mapped = statusMap[payment.status as string] ?? { payment_status: 'pending' };

    const updatePayload: Record<string, unknown> = {
      payment_status: mapped.payment_status,
      mp_payment_id: String(paymentId),
    };
    if (mapped.status) updatePayload.status = mapped.status;

    await supabase.from('orders').update(updatePayload).eq('id', orderId).eq('tenant_id', tenantId);

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('mp-webhook error:', err);
    // Sempre responde 200 para o Mercado Pago não ficar reenviando em loop
    // por causa de um erro nosso — o log acima já registrou o problema.
    return new Response('ok', { status: 200 });
  }
});
