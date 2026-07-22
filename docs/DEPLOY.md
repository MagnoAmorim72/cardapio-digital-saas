# Guia de deploy em produção

Este guia cobre o deploy gratuito na **Vercel**. O processo na **Cloudflare Pages** é equivalente (build command `npm run build`, output directory `dist`).

## 1. Suba o código para o GitHub

```bash
git init
git add .
git commit -m "Cardápio Digital SaaS"
git remote add origin https://github.com/SEU_USUARIO/cardapio-digital-saas.git
git push -u origin main
```

## 2. Importe o projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub.
2. Clique em **Add New → Project** e selecione o repositório.
3. A Vercel detecta automaticamente que é um projeto Vite. Confirme:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_DEFAULT_TENANT_SLUG` (usado apenas como fallback local; em produção o tenant é resolvido pelo subdomínio)
5. Clique em **Deploy**.

Em poucos minutos seu projeto estará em `https://seu-projeto.vercel.app`.

## 3. Configurar o domínio próprio com subdomínios por cliente

O sistema resolve o tenant pelo **subdomínio** (veja `src/services/tenantService.ts`). Para isso funcionar em produção:

1. Compre um domínio (ex: `meucardapio.com`) em qualquer registrador.
2. Na Vercel, vá em **Settings → Domains** e adicione:
   - `meucardapio.com` (domínio raiz, opcional — pode ser a landing comercial do SaaS)
   - `*.meucardapio.com` (**wildcard**, essencial — permite qualquer subdomínio de cliente)
3. Siga as instruções da Vercel para apontar os registros DNS (`CNAME` para o wildcard) no seu provedor de domínio.
4. Pronto: qualquer subdomínio criado (`burger-house.meucardapio.com`, `pizzaria-do-joao.meucardapio.com`) já resolve automaticamente para o tenant correspondente, sem precisar de novo deploy.

> **Cloudflare Pages** também suporta domínios wildcard: em **Custom domains**, adicione o domínio raiz e depois um registro `CNAME` do tipo `* → seu-projeto.pages.dev` no painel de DNS da Cloudflare.

## 4. Checklist de produção

- [ ] Variáveis de ambiente configuradas no provedor de hospedagem (não commitar `.env`)
- [ ] Domínio wildcard (`*.seudominio.com`) configurado e propagado (pode levar até 24h)
- [ ] RLS habilitado em todas as tabelas (já vem assim no `schema.sql` — não desabilite em produção)
- [ ] Bucket `tenant-assets` no Supabase Storage configurado como público (já incluído no `schema.sql`)
- [ ] Usuário administrador criado para cada novo cliente (veja `docs/CUSTOMIZATION.md`)
- [ ] Teste do fluxo completo: acessar o cardápio pelo subdomínio → adicionar produto ao carrinho → finalizar pedido → conferir se abre o WhatsApp corretamente → conferir se o pedido aparece no painel admin

## 5. Monitoramento e limites do plano gratuito

| Serviço | Limite gratuito | O que acontece ao exceder |
|---|---|---|
| Supabase | 500 MB banco, 1 GB storage, 50k usuários ativos/mês | Projeto pausado após 7 dias inativo (reative gratuitamente); upgrade necessário só em escala considerável |
| Vercel | 100 GB de banda/mês, builds ilimitados em projetos hobby | Acima disso, considere Cloudflare Pages (banda ilimitada no plano gratuito) como alternativa |

Para um SaaS em fase de validação (dezenas de clientes), esses limites são confortáveis. Monitore o uso no painel de cada serviço conforme a base de clientes crescer.
