# 🚀 Guia Rápido de Deploy na Vercel

## Pré-requisitos
- ✅ Projeto commitado no Git
- ✅ Repositório no GitHub/GitLab/Bitbucket
- ✅ Credenciais do Supabase

## Método 1: Deploy via Dashboard (Recomendado)

### Passo 1: Acesse a Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Faça login com seu GitHub/GitLab/Bitbucket

### Passo 2: Importe o Projeto
1. Clique em **"Add New Project"**
2. Selecione o repositório `art-intake-wizard`
3. A Vercel detectará automaticamente que é um projeto Vite

### Passo 3: Configure as Variáveis de Ambiente
Adicione estas 3 variáveis obrigatórias:

```
VITE_SUPABASE_PROJECT_ID=sokoafkbfjtplhihxgwl
VITE_SUPABASE_URL=https://sokoafkbfjtplhihxgwl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNva29hZmtiZmp0cGxoaWh4Z3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTEwODAsImV4cCI6MjA4MjE4NzA4MH0.UMwKgCWTaLvfrtO7CmEXL2W45yAva7IaCLLnqD5WGUk
```

### Passo 4: Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Seu app estará no ar! 🎉

## Método 2: Deploy via CLI

```bash
# 1. Instale a Vercel CLI
npm i -g vercel

# 2. Faça login
vercel login

# 3. Deploy de preview
vercel

# 4. Deploy para produção
vercel --prod
```

Durante o processo interativo, você precisará:
- Confirmar o diretório do projeto
- Adicionar as variáveis de ambiente quando solicitado

## Configurações Importantes

### ✅ O que já está configurado
- `vercel.json` com rotas SPA
- Headers de segurança
- Suporte a PWA e Service Worker
- `.vercelignore` para otimizar o deploy

### 🔒 Segurança
- **NUNCA** commite o arquivo `.env` 
- Use sempre variáveis de ambiente na Vercel
- As credenciais do Supabase são públicas (anon key)

## Funcionalidades PWA

Após o deploy, os usuários poderão:
- 📱 Instalar o app no celular/tablet
- 🔌 Usar offline (após primeira visita)
- 🔄 Receber atualizações automáticas

## Domínio Personalizado (Opcional)

### Via Dashboard:
1. Vá em **Settings > Domains**
2. Adicione seu domínio
3. Configure os DNS conforme instruções da Vercel

### Via CLI:
```bash
vercel domains add seu-dominio.com
```

## Atualizações Contínuas

Toda vez que você fizer push para a branch principal:
- ✅ Deploy automático
- ✅ Preview de branches
- ✅ Rollback automático em caso de erro

## Solução de Problemas

### Build falhou?
```bash
# Teste o build localmente
npm run build

# Se passar, o problema pode ser variáveis de ambiente
```

### App não carrega?
1. Verifique as variáveis de ambiente na Vercel
2. Verifique o console do navegador (F12)
3. Verifique os logs na Vercel Dashboard

### PWA não instala?
1. Verifique se está usando HTTPS (requisito)
2. Limpe o cache do navegador
3. Verifique se o arquivo `manifest.webmanifest` está acessível

## Links Úteis

- [Dashboard Vercel](https://vercel.com/dashboard)
- [Documentação Vercel](https://vercel.com/docs)
- [Supabase Dashboard](https://app.supabase.com)

## Próximos Passos

Após o deploy:
1. ✅ Teste todas as funcionalidades
2. ✅ Configure domínio personalizado
3. ✅ Configure analytics (opcional)
4. ✅ Configure notificações de deploy

---

**Projeto:** Art Intake Wizard  
**Framework:** Vite + React + TypeScript  
**Hospedagem:** Vercel  
**Backend:** Supabase
