# ✅ Checklist de Deploy - Vercel

Use este checklist antes de fazer o deploy para garantir que tudo está configurado corretamente.

## Pré-Deploy

### Git e Repositório
- [ ] Código está commitado
- [ ] Código está no GitHub/GitLab/Bitbucket
- [ ] Branch principal está atualizada
- [ ] `.env` **NÃO** está commitado (verificar `.gitignore`)
- [ ] Arquivos desnecessários estão no `.gitignore`

### Variáveis de Ambiente
- [ ] `VITE_SUPABASE_PROJECT_ID` configurado
- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` configurado
- [ ] Arquivo `.env.example` criado como referência

### Build Local
- [ ] `npm install` executado sem erros
- [ ] `npm run build` executado com sucesso
- [ ] `npm run preview` mostra o app funcionando
- [ ] Todas as rotas estão funcionando
- [ ] Formulários salvam no Supabase

### Arquivos de Configuração
- [ ] `vercel.json` existe
- [ ] `.vercelignore` existe
- [ ] `vite.config.ts` está correto
- [ ] PWA configurado no `vite.config.ts`

## Durante o Deploy

### Vercel Dashboard
- [ ] Projeto importado corretamente
- [ ] Framework detectado como Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Variáveis de Ambiente na Vercel
- [ ] `VITE_SUPABASE_PROJECT_ID` adicionado
- [ ] `VITE_SUPABASE_URL` adicionado
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` adicionado
- [ ] Variáveis aplicadas a Produção, Preview e Development

### Deploy
- [ ] Deploy iniciado
- [ ] Build concluído sem erros
- [ ] Deploy bem-sucedido (status 200)

## Pós-Deploy

### Testes Funcionais
- [ ] App abre corretamente
- [ ] Roteamento funciona (navegação entre páginas)
- [ ] Formulário de anamnese abre
- [ ] Formulário envia dados para Supabase
- [ ] Admin Dashboard carrega
- [ ] Admin Dashboard mostra dados do Supabase
- [ ] Assinatura digital funciona
- [ ] Upload de imagens funciona

### PWA
- [ ] Manifest.webmanifest carrega
- [ ] Service Worker registrado
- [ ] App pode ser instalado
- [ ] App funciona offline (após cache)
- [ ] Ícone do app está correto

### Performance
- [ ] Core Web Vitals aceitáveis
- [ ] Lighthouse score > 90
- [ ] Imagens otimizadas
- [ ] CSS e JS minificados

### SEO e Segurança
- [ ] Meta tags corretas
- [ ] HTTPS habilitado
- [ ] Headers de segurança aplicados
- [ ] Robots.txt configurado (se necessário)

### Mobile
- [ ] Responsivo em celular
- [ ] Responsivo em tablet
- [ ] Touch events funcionam
- [ ] Modais com scroll funcionam

## Configurações Opcionais

### Domínio Personalizado
- [ ] Domínio adicionado na Vercel
- [ ] DNS configurado
- [ ] SSL/TLS ativo
- [ ] Redirect www → não-www (ou vice-versa)

### Analytics
- [ ] Vercel Analytics habilitado
- [ ] Google Analytics configurado (se necessário)

### Notificações
- [ ] Notificações de deploy configuradas
- [ ] Email de falhas configurado
- [ ] Slack/Discord webhook (se necessário)

## Rollback Plan

Em caso de problemas:
- [ ] Sabe reverter para versão anterior
- [ ] Sabe acessar logs da Vercel
- [ ] Sabe pausar deployments automáticos

## Documentação

- [ ] README.md atualizado
- [ ] DEPLOY.md revisado
- [ ] Variáveis de ambiente documentadas
- [ ] Dependências atualizadas

---

## Status do Deploy

**Data:** ___/___/______  
**Responsável:** _________________  
**URL:** https://_________________.vercel.app  
**Status:** [ ] Sucesso [ ] Falha [ ] Pendente

### Notas:
```
[Adicione observações importantes aqui]
```

---

**Dica:** Use este checklist como um guia antes de cada deploy importante. Marque os itens conforme completa.
