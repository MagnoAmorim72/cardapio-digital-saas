// Edge Function: create-payment
//
// Recebe os dados do carrinho, salva o pedido no banco (com status de
// pagamento "pending") e cria uma preferência de pagamento no Mercado Pago,
// devolvendo o link de checkout para o navegador redirecionar o cliente.
//
// Roda com a SERVICE ROLE KEY (nunca exposta ao navegador) — é por isso que
// esta função, e só ela, pode gravar pedidos com payment_method = 'card'.
// A chave de acesso do Mercado Pago (mp_access_token) também nunca sai
// daqui: fica só na memória do servidor durante a execução.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface CartItemPayload {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

interface RequestBody {
  tenant_id: string;
  items: CartItemPayload[];
  customer_name: string | null;
  coupon_code: string | null;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  return_url_base: string; // window.location.origin do cliente, ex: https://burger-house-pi-seven.vercel.app
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();

    if (!body.tenant_id || !Array.isArray(body.items) || body.items.length === 0) {
      return jsonError('Dados do pedido incompletos.', 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1) Busca as credenciais do Mercado Pago deste estabelecimento.
    const { data: paymentSettings, error: settingsError } = await supabase
      .from('tenant_payment_settings')
      .select('mp_access_token, is_test_mode')
      .eq('tenant_id', body.tenant_id)
      .maybeSingle();

    if (settingsError) throw settingsError;
    if (!paymentSettings?.mp_access_token) {
      return jsonError('Pagamento com cartão não configurado para este estabelecimento.', 400);
    }

    // 2) Cria o pedido no banco (status de pagamento "pending" até a confirmação
    //    chegar pelo webhook do Mercado Pago).
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id: body.tenant_id,
        customer_name: body.customer_name,
        customer_phone: null,
        items: body.items,
        coupon_code: body.coupon_code,
        subtotal: body.subtotal,
        discount: body.discount,
        delivery_fee: body.delivery_fee,
        total: body.total,
        notes: body.notes,
        status: 'pending',
        payment_method: 'card',
        payment_status: 'pending',
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // 3) Monta e cria a preferência de pagamento no Mercado Pago.
    const notificationUrl = `${supabaseUrl}/functions/v1/mp-webhook?tenant_id=${body.tenant_id}`;

    const preferencePayload = {
      items: body.items.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'BRL',
      })),
      external_reference: order.id,
      notification_url: notificationUrl,
      back_urls: {
        success: `${body.return_url_base}/pagamento/sucesso`,
        pending: `${body.return_url_base}/pagamento/pendente`,
        failure: `${body.return_url_base}/pagamento/erro`,
      },
      auto_return: 'approved',
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paymentSettings.mp_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error('Erro do Mercado Pago:', errText);
      return jsonError('Não foi possível iniciar o pagamento. Tente novamente.', 502);
    }

    const preference = await mpResponse.json();
    const checkoutUrl = paymentSettings.is_test_mode
      ? preference.sandbox_init_point ?? preference.init_point
      : preference.init_point;

    // 4) Guarda o id da preferência no pedido, para conseguirmos rastrear depois.
    await supabase.from('orders').update({ mp_preference_id: preference.id }).eq('id', order.id);

    return new Response(JSON.stringify({ checkout_url: checkoutUrl, order_id: order.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('create-payment error:', err);
    return jsonError('Erro inesperado ao criar o pagamento.', 500);
  }
});

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}
