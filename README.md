# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploy com Lovable

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

### Deploy na Vercel

Este projeto está pré-configurado para deploy na Vercel. Siga os passos abaixo:

#### 1. Preparação

Certifique-se de que seu projeto está commitado no Git e enviado para o GitHub/GitLab/Bitbucket.

#### 2. Deploy via Vercel Dashboard

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe seu repositório Git
4. Configure as **variáveis de ambiente** (obrigatório):
   ```
   VITE_SUPABASE_PROJECT_ID=seu_project_id
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
   ```
5. Clique em **"Deploy"**

#### 3. Deploy via CLI (Alternativa)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

#### 4. Configuração de Variáveis de Ambiente

As variáveis de ambiente podem ser configuradas de 3 formas:

**Via Dashboard:**
1. Acesse seu projeto no Vercel
2. Vá em Settings > Environment Variables
3. Adicione as variáveis do arquivo `.env.example`

**Via CLI:**
```bash
vercel env add VITE_SUPABASE_PROJECT_ID
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
```

**Via arquivo `.env` (para desenvolvimento local apenas):**
- Copie `.env.example` para `.env`
- Preencha com suas credenciais do Supabase

#### 5. PWA e Service Worker

O projeto está configurado como PWA (Progressive Web App). Após o deploy:
- Os usuários podem instalar o app em seus dispositivos
- Funciona offline após primeira visita
- Recebe atualizações automáticas

#### 6. Domínio Personalizado

**Via Vercel Dashboard:**
1. Vá em Settings > Domains
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

**Via CLI:**
```bash
vercel domains add seu-dominio.com
```

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Supabase Integration

Este projeto usa Supabase como backend. Certifique-se de:

1. Ter um projeto Supabase criado
2. Configurar as políticas RLS (Row Level Security) adequadamente
3. Executar as migrations no banco de dados (pasta `/supabase`)
4. Configurar as variáveis de ambiente corretamente

### Obter credenciais do Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon/Public Key → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Project ID está na URL do projeto

