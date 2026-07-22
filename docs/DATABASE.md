# Modelo de dados

Schema completo em [`supabase/schema.sql`](../supabase/schema.sql). Este documento explica as decisões de modelagem.

## Diagrama lógico (simplificado)

```
tenants (1) ───< tenant_users >─── (1) auth.users
   │
   ├──< categories
   ├──< products >── categories (opcional)
   ├──< coupons
   └──< orders
```

## Tabelas

### `tenants`
Cada linha representa um estabelecimento cliente do SaaS. Contém identidade visual (`logo_url`, `banner_url`, `theme`), dados de contato, regras de entrega e horário de funcionamento (`opening_hours`, em JSON por permitir horários diferentes por dia sem tabelas extras).

### `tenant_users`
Tabela de junção entre `tenants` e `auth.users` do Supabase. Permite múltiplos administradores por estabelecimento (`role`: `owner`, `admin`, `staff`), preparando o terreno para equipes maiores sem alterar o schema.

### `categories` / `products`
Sempre vinculados a um `tenant_id`. `products.tags` é um array de texto (`novo`, `promocao`, `mais_vendido`, `vegano`, `sem_gluten`) — arrays evitam uma tabela de junção extra para um dado simples e de baixa cardinalidade. `sold_count` é incrementado a cada pedido concluído (via lógica de aplicação ou trigger futura) e alimenta o ranking de "mais vendidos".

### `coupons`
Suporta desconto percentual ou fixo, com controle de uso (`max_uses`/`used_count`) e validade (`valid_from`/`valid_until`).

### `orders`
Guarda um **snapshot** dos itens (`items jsonb`) no momento da compra — mesmo que o produto seja editado ou removido depois, o histórico do pedido permanece íntegro. É a base para o dashboard de estatísticas e para uma futura integração de impressão automática ou notificação em tempo real (Supabase Realtime já funciona nessa tabela sem nenhuma alteração de schema).

## Isolamento multi-tenant (Row Level Security)

Toda tabela sensível tem RLS habilitado. A regra geral:

| Tabela | Leitura pública | Escrita |
|---|---|---|
| `tenants` | Sim (apenas `status = 'active'`) | Somente admin do próprio tenant |
| `categories` | Sim (apenas ativas) | Somente admin do próprio tenant |
| `products` | Sim | Somente admin do próprio tenant |
| `coupons` | Sim (apenas ativos — validação de regras acontece na aplicação) | Somente admin do próprio tenant |
| `orders` | Não | Inserção pública (checkout), leitura/atualização somente admin |

A função `public.is_tenant_admin(tenant_id)` centraliza essa checagem e é reaproveitada em todas as políticas, evitando duplicação de lógica de segurança.

**Por que isso importa comercialmente**: mesmo que a chave `anon` do Supabase seja pública (ela precisa ser, é usada no frontend), um cliente nunca consegue ler ou escrever dados de outro estabelecimento — o banco recusa a operação antes mesmo de chegar à aplicação.

## Índices e performance

- `idx_products_search`: índice GIN com `to_tsvector('portuguese', ...)` para buscas por nome/descrição eficientes mesmo com milhares de produtos.
- `idx_products_tenant`, `idx_products_category`, `idx_orders_tenant`: aceleram os filtros mais comuns do dia a dia (listar produtos de um tenant, pedidos recentes, etc).

## Extensões futuras sugeridas

- `payment_status`, `payment_method` em `orders` para pagamentos online.
- Tabela `loyalty_points` vinculada a um identificador de cliente (telefone) para programa de fidelidade.
- Tabela `print_jobs` para fila de impressão automática na cozinha.
- Tabela `ai_recommendations_log` para rastrear sugestões de produtos exibidas e taxa de conversão, alimentando o motor de IA.

Nenhuma dessas extensões exige alterar as tabelas existentes — todas se conectam por `tenant_id` e/ou `order_id`, seguindo o mesmo padrão de isolamento já estabelecido.
