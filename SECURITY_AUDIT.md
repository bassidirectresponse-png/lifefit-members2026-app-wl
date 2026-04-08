# Security Audit — Life Fit Members

Auditoria realizada em 2026-04-08.

## Vulnerabilidades Encontradas e Corrigidas

### CRITICAL

| # | Vulnerabilidade | Correção | Arquivo |
|---|---|---|---|
| 1 | Credenciais hardcoded em scripts de setup | Scripts deletados (`scripts/run-sql.mjs`, `scripts/setup-db.mjs`) | scripts/ (removido) |
| 2 | Service role key exposta em código commitado | Removida. Usar `process.env.SUPABASE_SERVICE_ROLE_KEY` server-only | .env.local.example |
| 3 | Webhook com auth opcional (bypass se WEBHOOK_SECRET não setado) | Auth agora obrigatória — retorna 503 se secret não configurado | app/api/webhooks/purchase/route.ts |
| 4 | Storage bucket público — PDFs/imagens acessíveis sem login | Bucket alterado para privado. Policy: only authenticated users | supabase/migration-003-security.sql |
| 5 | user_purchases sem INSERT policy — admin não conseguia gravar | Policies INSERT/DELETE adicionadas | migration-003-security.sql |

### HIGH

| # | Vulnerabilidade | Correção | Arquivo |
|---|---|---|---|
| 6 | Zero security headers (sem CSP, X-Frame-Options, HSTS) | Todos os headers implementados via next.config.mjs | next.config.mjs |
| 7 | Source maps habilitados em produção | `productionBrowserSourceMaps: false` | next.config.mjs |
| 8 | Sem validação server-side — só client-side Zod | Schemas Zod compartilhados criados em lib/security.ts | lib/security.ts |
| 9 | Usuária pode alterar próprio role para admin | Policy WITH CHECK impede mudança de role pelo próprio user | migration-003-security.sql |
| 10 | Webhook não valida body com Zod | `webhookPurchaseSchema` valida email, module_id, transaction_id | app/api/webhooks/purchase/route.ts |

### MEDIUM

| # | Vulnerabilidade | Correção | Arquivo |
|---|---|---|---|
| 11 | Sem robots.txt — crawlers indexando /admin | robots.txt bloqueia /admin, /api, /conta, /aula, /semana | public/robots.txt |
| 12 | Sem rate limiting | `checkRateLimit()` implementado in-memory (webhook usa) | lib/security.ts |
| 13 | Webhook resposta revela se email existe | Mensagem genérica "Processing failed" para user not found | webhooks/purchase/route.ts |

## Validação de Upload

Implementado em `lib/security.ts`:
- Whitelist de MIME types (JPEG, PNG, WebP, PDF, MP3, MP4)
- SVG bloqueado explicitamente (vetor de XSS)
- Tamanho máximo: 10MB
- Magic bytes validation para MIME real
- Sanitização de filename (remove `../`, caracteres especiais)
- Rename para UUID antes de salvar

## Headers de Segurança (next.config.mjs)

```
Content-Security-Policy: default-src 'self'; script-src 'self' ...; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
X-DNS-Prefetch-Control: off
```

## RLS Summary (todas as tabelas com RLS habilitado)

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | own + admin | admin + trigger | own (no role change) + admin | - |
| modulos | authenticated | admin | admin | admin |
| aulas | authenticated | admin | admin | admin |
| progresso | own + admin | own | own | own |
| checklist_progress | own | own | own | own |
| user_purchases | own + admin | admin | - | admin |
| storage.objects | authenticated | admin | - | admin |

## Testes Manuais Realizados

| Teste | Resultado |
|---|---|
| Acessar /admin sem login | Redirecionado para /login |
| Acessar /admin como membro | Redirecionado para / |
| POST /api/webhooks/purchase sem Authorization header | 401 Unauthorized |
| POST /api/webhooks/purchase com WEBHOOK_SECRET não configurado | 503 |
| POST /api/webhooks/purchase com body inválido | 400 Invalid payload |
| Tentar UPDATE role via Supabase JS como membro | Bloqueado por RLS |
| Acessar storage sem autenticação | Bloqueado por RLS |

## Pendências Humanas (ação do dono do projeto)

1. **URGENTE: Rotacionar TODAS as chaves do Supabase** — as chaves foram expostas no histórico git. Vá em Supabase Dashboard > Settings > API > regenerar anon key e service role key
2. **Ativar 2FA** na conta Supabase e no GitHub
3. **Configurar WEBHOOK_SECRET** no .env.local (gerar com `openssl rand -hex 32`)
4. **Configurar SUPABASE_SERVICE_ROLE_KEY** no .env.local (a nova chave rotacionada)
5. **Limpar histórico git** com `git filter-repo` para remover commits com secrets
6. **Configurar Cloudflare** com WAF rules e Turnstile nos forms
7. **Configurar Sentry** para monitoramento de erros em produção
8. **Auditar dependências** regularmente com `npm audit`
9. **Ativar Dependabot** no repositório GitHub
10. **Configurar alertas** no Supabase para eventos de segurança
