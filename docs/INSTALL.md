# Guia de instalação local

## Pré-requisitos

- Node.js 18 ou superior
- Uma conta gratuita no [Supabase](https://supabase.com)
- Git (opcional, mas recomendado)

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **New Project**, escolha um nome (ex: `cardapio-saas`) e uma senha para o banco.
3. Aguarde a criação (leva cerca de 2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase/schema.sql` deste repositório, copie todo o conteúdo e cole no editor.
6. Clique em **Run**. Isso cria todas as tabelas, políticas de segurança (RLS), o bucket de storage e um tenant de demonstração (`burger-house`).

## 2. Criar um usuário administrador de teste

1. No painel do Supabase, vá em **Authentication → Users → Add user** e crie um usuário com e-mail/senha.
2. Copie o `UID` desse usuário.
3. Volte ao **SQL Editor** e rode (substituindo `SEU_UID_AQUI`):

```sql
insert into public.tenant_users (tenant_id, user_id, role)
values ('00000000-0000-0000-0000-000000000001', 'd6004964-a932-4743-86b7-5379051ba69b', 'owner');
```

Isso vincula seu usuário como administrador do tenant de demonstração (`Burger House`).

## 3. Obter as credenciais da API

Em **Settings → API**, copie:
- **Project URL**
- **anon public key**

## 4. Configurar o projeto localmente

```bash
# instale as dependências
npm install

# copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Edite o `.env` com os valores copiados do Supabase:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_DEFAULT_TENANT_SLUG=burger-house
```

## 5. Rodar o projeto

```bash
npm run dev
```

Acesse:
- **Cardápio público**: http://localhost:5173
- **Painel administrativo**: http://localhost:5173/admin/login (use o e-mail/senha criados no passo 2)

## 6. Comandos úteis

| Comando | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento com hot-reload |
| `npm run build` | Gera o build de produção em `dist/` (roda type-check antes) |
| `npm run preview` | Serve o build de produção localmente para testar |
| `npm run lint` | Roda o ESLint em todo o projeto |

## Problemas comuns

**"Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas"**
→ Verifique se o arquivo `.env` existe na raiz do projeto (não `.env.example`) e se o servidor de dev foi reiniciado após criá-lo.

**Cardápio mostra "Estabelecimento não encontrado"**
→ Confirme se `VITE_DEFAULT_TENANT_SLUG` no `.env` corresponde ao `slug` de um tenant existente na tabela `tenants`.

**Erro 401/403 ao salvar no painel admin**
→ Confirme se o usuário logado está vinculado ao tenant na tabela `tenant_users` (passo 2 acima). As políticas de RLS bloqueiam escrita de qualquer usuário não vinculado.
