-- Add cancel_token to bookings to prevent IDOR on cancel endpoint.
-- The booking ID alone is enough to VIEW a booking (acceptable - tracking link
-- is shareable). To CANCEL, the caller must also know cancel_token, which is
-- only included in the confirmation email and the personal tracking URL.
--
-- For existing rows (created before this migration), backfill with a fresh
-- random UUID so they remain cancellable via their existing tracking link
-- (the link generator will start including ?cancel=<token> for them too).

alter table bookings
  add column cancel_token uuid not null default gen_random_uuid();

create index bookings_cancel_token_idx on bookings(cancel_token);

-- Coluna pra deduplicar o cron de lembrete 24h antes (Cloudflare Cron Trigger).
-- Quando o cron envia, marca aqui. Reexecucoes do mesmo dia nao reenviam.
alter table bookings
  add column reminder_sent_at timestamptz;

-- Rate limiting persistido. Fixed window por chave (ip:bucket).
-- Limpeza opcional via cron mensal: delete from rate_limit_buckets where
-- window_start < now() - interval '7 days'.
create table rate_limit_buckets (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);
create index rate_limit_buckets_window_idx on rate_limit_buckets(window_start);
alter table rate_limit_buckets enable row level security;
-- Nenhuma policy de leitura: somente service-role acessa.
