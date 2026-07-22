# Guia de customização — onboarding de novos clientes (tenants)

Como o sistema é **multi-tenant**, você não cria um projeto novo para cada cliente: cria uma nova linha na tabela `tenants` e o cardápio já fica disponível no subdomínio configurado. Este guia mostra o passo a passo comercial completo.

## 1. Cadastrar o estabelecimento

No **SQL Editor** do Supabase (ou futuramente por uma tela de onboarding self-service), rode:

```sql
insert into public.tenants (name, slug, whatsapp_number, address, delivery_fee, description)
values (
  'Pizzaria do João',
  'pizzaria-do-joao',        -- vira pizzaria-do-joao.seudominio.com
  '5582988887777',
  'Rua das Flores, 45 — Centro',
  5.00,
  'A melhor pizza artesanal da cidade.'
);
```

O `slug` deve ser único, sem espaços ou acentos — use o utilitário `slugify` (`src/utils/slugify.ts`) como referência caso automatize esse cadastro.

## 2. Criar o acesso do administrador do cliente

1. Em **Authentication → Users**, crie o usuário com o e-mail do cliente (ou peça para ele se cadastrar via `signUpTenantOwner` em `src/services/authService.ts`, se você implementar uma tela pública de cadastro).
2. Vincule-o ao tenant:

```sql
insert into public.tenant_users (tenant_id, user_id, role)
select id, 'UID_DO_USUARIO', 'owner'
from public.tenants where slug = 'pizzaria-do-joao';
```

3. Envie ao cliente o link do painel: `https://pizzaria-do-joao.seudominio.com/admin/login`

## 3. Onboarding guiado (o que o cliente faz sozinho)

Assim que o cliente acessa `/admin/configuracoes`, ele mesmo consegue, sem depender de você:

- Enviar **logo** e **banner**
- Definir **cores da marca** (campos `Cor primária` / `Cor secundária`, no formato `R G B`, ex: `255 90 31`)
- Preencher **WhatsApp, endereço, Instagram, Facebook**
- Configurar **taxa de entrega** e **pedido mínimo**
- Ajustar o **horário de funcionamento** de cada dia da semana

Em `/admin/categorias` e `/admin/produtos`, ele cadastra o cardápio completo — fotos, preços, promoções, ingredientes e etiquetas (Novo, Promoção, Mais vendido, Vegano, Sem Glúten).

## 4. Gerar o QR Code do cardápio

O cardápio público já é responsivo e acessível diretamente pela URL do subdomínio. Para gerar o QR Code:

1. Use um gerador gratuito, como [qrcode-monkey.com](https://www.qr-code-generator.com) ou a biblioteca `qrcode` (Node/JS) caso quiera automatizar isso dentro do próprio painel futuramente.
2. Aponte para `https://pizzaria-do-joao.seudominio.com`.
3. Entregue o QR Code em PDF/PNG para o cliente imprimir nas mesas, embalagens ou cardápio físico.

> **Ideia de evolução**: adicionar um botão "Baixar QR Code" dentro de `/admin/configuracoes`, gerando o QR Code no client-side (bibliotecas gratuitas como `qrcode.react` funcionam bem aqui).

## 5. Escolhendo ícones de categoria

O campo **Ícone** em `/admin/categorias` aceita os seguintes nomes (mapeados em `src/components/menu/CategoryChips.tsx`):

`Beef`, `CupSoda`, `IceCreamCone`, `Pizza`, `Salad`, `Sandwich`, `Soup`, `Fish`, `Cookie`, `Coffee`, `Wine`, `Utensils`, `UtensilsCrossed`

Para adicionar mais opções, importe o ícone desejado da [biblioteca Lucide](https://lucide.dev/icons) diretamente em `ICON_MAP` nesse arquivo — evite usar `import * as Icons`, pois isso quebra o code-splitting e infla o tamanho do site para todos os clientes.

## 6. Definindo o plano do cliente

O campo `plan` na tabela `tenants` (`free`, `pro`, `premium`) já existe para suportar diferentes níveis de assinatura:

```sql
update public.tenants set plan = 'pro' where slug = 'pizzaria-do-joao';
```

Use esse campo como gate de funcionalidades ao evoluir o produto (ex: liberar cupons ilimitados só no plano `pro`, liberar pagamento online só no `premium`).

## 7. Encerrando ou suspendendo um cliente

```sql
update public.tenants set status = 'suspended' where slug = 'pizzaria-do-joao';
```

Tenants com `status != 'active'` deixam de ser acessíveis publicamente (a política de RLS de leitura já filtra por isso), sem apagar nenhum dado — ideal para clientes inadimplentes ou em pausa temporária.
