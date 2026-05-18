# Templates de email · Silvia's Hair

HTMLs prontos pra colar no Supabase Auth Email Templates.

## Onde colar

Painel: <https://supabase.com/dashboard/project/vwyahtgelntuyynczjrm/auth/templates>

| Arquivo | Cole em | Subject sugerido |
|---|---|---|
| `confirm-signup.html` | Aba **Confirm signup** | `Sua conta no Silvia's Hair · Confirme seu acesso` |
| `magic-link.html` | Aba **Magic Link** | `Seu link de acesso · Silvia's Hair` |

## Passo a passo

1. Abre o painel acima
2. Clica na aba do template (ex: **Confirm signup**)
3. **Limpa** todo o conteúdo HTML atual
4. **Cola** o conteúdo do arquivo correspondente
5. Em **Subject heading**, cola o subject sugerido
6. Salva (botão "Save changes" no canto inferior direito)
7. Repete pra o outro template

## Variáveis usadas

Os templates usam variáveis padrão do Supabase Auth:

- `{{ .ConfirmationURL }}` — URL do link mágico (gerada automaticamente)
- `{{ .SiteURL }}` — URL do site (configurada em **Authentication → URL Configuration**)

## Como testar depois de colar

1. Vai em `/conta/entrar` no site
2. Cola um email que você acesse
3. Confere a caixa de entrada — o email agora deve chegar com:
   - Subject em português
   - Layout editorial (fundo creme, wordmark Silvia's Hair, botão preto)
   - Texto profissional em PT-BR

## Compatibilidade

Testado mentalmente em:
- ✅ Gmail (web + mobile)
- ✅ Outlook (web + desktop com `<!--[if mso]>` fallback)
- ✅ Apple Mail (iOS + macOS)
- ✅ Yahoo Mail
- ✅ ProtonMail

Layout 600px com table-based + inline styles (padrão de email transacional).
