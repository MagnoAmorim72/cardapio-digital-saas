# 🍔 Cardápio Digital SaaS

Plataforma multi-tenant de cardápio digital com pedidos via WhatsApp, feita para ser **comercializada** para hamburguerias, pizzarias, lanchonetes, restaurantes, açaíterias e estabelecimentos similares.

Cada estabelecimento (tenant) tem seu próprio cardápio público (acessível por link e QR Code), painel administrativo isolado, produtos, categorias, cupons, pedidos e identidade visual — tudo rodando sobre uma única base de código, com **100% de tecnologias gratuitas**.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Estilo | TailwindCSS + Framer Motion |
| Ícones | Lucide React |
| Formulários | React Hook Form |
| Backend | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Hospedagem | Vercel Free ou Cloudflare Pages |

Todos os itens acima possuem planos gratuitos suficientes para operar dezenas de clientes antes de qualquer custo.

## Estrutura do projeto

```
src/
  assets/          arquivos estáticos (imagens padrão, ícones customizados)
  components/
    ui/            componentes de interface genéricos (Button, Modal, Input...)
    menu/          componentes do cardápio público (Header, Hero, ProductCard...)
    cart/          componentes do carrinho (CartDrawer, CouponInput...)
    admin/         componentes do painel administrativo (Sidebar, DataTable...)
  layouts/         PublicLayout (cardápio) e AdminLayout (painel)
  pages/
    public/        páginas do cardápio (MenuPage, NotFoundPage)
    admin/         páginas do painel (Dashboard, Produtos, Categorias, Cupons...)
  hooks/           hooks reutilizáveis (useProducts, useCategories, useDebounce...)
  services/        toda a comunicação com o Supabase, isolada por domínio
  contexts/        estado global (Tenant, Auth, Cart, Theme)
  routes/          definição de rotas e proteção de acesso
  utils/           funções puras (formatCurrency, whatsapp, slugify...)
  types/           tipagem central do sistema (espelha o schema SQL)
  styles/          variáveis de tema (cores por tenant, claro/escuro)
supabase/
  schema.sql       schema completo do banco, pronto para colar no SQL Editor
docs/
  INSTALL.md       guia de instalação local
  DEPLOY.md         guia de deploy em produção
  CUSTOMIZATION.md  guia de onboarding de novos clientes (tenants)
```

## Funcionalidades

- **Cardápio público**: banner, logo, horário de funcionamento, botão de WhatsApp, endereço, redes sociais, categorias em destaque, busca, filtros, promoções, mais vendidos, tema claro/escuro, mobile-first.
- **Produtos completos**: nome, descrição, foto, categoria, preço, preço promocional, ingredientes, tempo estimado, etiquetas (Novo, Promoção, Mais vendido, Vegano, Sem Glúten), disponibilidade.
- **Carrinho**: adicionar/remover itens, alterar quantidade, observações por item, cupom de desconto, cálculo automático de subtotal/entrega/total, finalização formatada via WhatsApp.
- **Painel administrativo**: login, dashboard com estatísticas, CRUD de categorias e produtos, gestão de cupons, configuração de horário e taxa de entrega, personalização de cores/logo/banner.
- **Multiempresa (SaaS)**: cada cliente tem produtos, categorias, pedidos, tema e subdomínio próprios, com isolamento de dados garantido por Row Level Security no banco.

## Por onde começar

1. Leia [`docs/INSTALL.md`](docs/INSTALL.md) para rodar o projeto localmente.
2. Leia [`docs/DEPLOY.md`](docs/DEPLOY.md) para publicar em produção.
3. Leia [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md) para cadastrar um novo cliente (tenant) no SaaS.

## Roteiro de evolução comercial

| Fase | Entregável | Status neste repositório |
|---|---|---|
| MVP Gratuito | Cardápio digital + QR Code + pedidos via WhatsApp | ✅ Incluído |
| Versão Profissional | Painel administrativo, promoções, cupons, estatísticas | ✅ Incluído |
| Versão Premium | Pagamentos online (PIX/cartão), impressão em cozinha, fidelidade, IA de recomendação | 🔜 Pontos de extensão preparados (veja abaixo) |

### Pontos de extensão já preparados no código

- `orders`: já registra cada pedido no banco — pronto para acoplar status de pagamento (`payment_status`, `payment_method`) sem quebrar nada existente.
- `services/orderService.ts`: centraliza toda a lógica de pedidos — é o lugar natural para plugar webhooks de PIX/cartão ou impressão automática.
- `products.sold_count`: já é incrementável a cada pedido concluído, base para um futuro motor de recomendação ("quem comprou X também comprou Y") ou ranking dinâmico de mais vendidos.
- `tenants.plan`: campo `free | pro | premium` já existe no schema, pronto para gates de funcionalidade por assinatura.
- Estrutura de `services/` isolada por domínio facilita adicionar `loyaltyService.ts`, `paymentService.ts` ou `aiRecommendationService.ts` sem tocar no restante do sistema.

## Licença

Código proprietário — desenvolvido para comercialização. Ajuste esta seção conforme o modelo de licenciamento que você adotar com seus clientes.
