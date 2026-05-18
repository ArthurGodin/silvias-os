-- Silvia's OS · Schema V1 (mono-marca, LGPD-ready)
-- Convenções: UUID, created_at/updated_at/deleted_at em tudo, RLS habilitado.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type service_category_slug as enum (
  'cortes',
  'tratamentos',
  'mudanca-de-forma',
  'coloracao',
  'clareamento',
  'unhas',
  'estetica',
  'depilacao',
  'especiais'
);

create type booking_status as enum (
  'pending_payment',
  'confirmed',
  'checked_in',
  'completed',
  'cancelled_client',
  'cancelled_house',
  'no_show'
);

create type staff_role as enum (
  'admin',
  'manager',
  'stylist',
  'receptionist'
);

create type consent_type as enum (
  'privacy_policy',
  'terms_of_use',
  'photo_before_after',
  'marketing_email',
  'marketing_sms'
);

create type payment_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded',
  'expired'
);

-- ============== UNIDADES ==============

create table units (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  shopping_name text not null,
  address text not null,
  floor text,
  phone text,
  whatsapp text,
  lat numeric(10,7),
  lng numeric(10,7),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ============== CATEGORIAS E SERVIÇOS ==============

create table service_categories (
  id uuid primary key default gen_random_uuid(),
  slug service_category_slug unique not null,
  index int not null,
  title text not null,
  short_title text not null,
  description text,
  long_description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid not null references service_categories(id),
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  from_price_cents int not null check (from_price_cents >= 0),
  requires_deposit boolean not null default false,
  deposit_percentage int not null default 30 check (deposit_percentage between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index services_category_idx on services(category_id);
create index services_active_idx on services(is_active) where deleted_at is null;

-- ============== EQUIPE ==============

create table staff (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  role staff_role not null default 'stylist',
  email citext unique,
  phone text,
  bio text,
  credentials text[] default '{}',
  image_url text,
  google_calendar_id text,
  primary_unit_id uuid references units(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index staff_user_idx on staff(user_id);

create table staff_services (
  staff_id uuid not null references staff(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table staff_units (
  staff_id uuid not null references staff(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  primary key (staff_id, unit_id)
);

create table working_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  unit_id uuid references units(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  open_time time not null,
  close_time time not null,
  created_at timestamptz not null default now(),
  check (open_time < close_time)
);
create index working_hours_staff_idx on working_hours(staff_id, weekday);

create table time_off (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);
create index time_off_staff_range_idx on time_off(staff_id, starts_at, ends_at);

-- ============== CLIENTES ==============

create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email citext,
  phone text not null,
  notes text,
  hair_type text,
  allergies text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  lifetime_value_cents int not null default 0,
  visit_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index clients_phone_idx on clients(phone);
create index clients_email_idx on clients(email);
create index clients_user_idx on clients(user_id);

create table client_consents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  consent_type consent_type not null,
  version text not null,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  revoked_at timestamptz
);
create index client_consents_client_idx on client_consents(client_id, consent_type);

-- ============== AGENDAMENTOS ==============

create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  staff_id uuid not null references staff(id),
  unit_id uuid not null references units(id),
  service_id uuid not null references services(id),
  scheduled_at timestamptz not null,
  duration_minutes int not null,
  ends_at timestamptz generated always as (scheduled_at + (duration_minutes || ' minutes')::interval) stored,
  status booking_status not null default 'pending_payment',
  total_cents int not null,
  deposit_cents int not null default 0,
  google_calendar_event_id text,
  internal_notes text,
  client_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancellation_reason text
);
create index bookings_scheduled_idx on bookings(scheduled_at);
create index bookings_staff_scheduled_idx on bookings(staff_id, scheduled_at);
create index bookings_unit_scheduled_idx on bookings(unit_id, scheduled_at);
create index bookings_client_idx on bookings(client_id, scheduled_at desc);

create table booking_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  from_status booking_status,
  to_status booking_status not null,
  changed_by uuid references auth.users(id),
  reason text,
  occurred_at timestamptz not null default now()
);
create index booking_history_booking_idx on booking_history(booking_id, occurred_at);

create table service_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  client_id uuid not null references clients(id),
  staff_id uuid not null references staff(id),
  unit_id uuid not null references units(id),
  service_id uuid not null references services(id),
  performed_at timestamptz not null default now(),
  stylist_notes text,
  product_used text,
  formula_used text,
  total_charged_cents int,
  created_at timestamptz not null default now()
);
create index service_records_client_idx on service_records(client_id, performed_at desc);
create index service_records_staff_idx on service_records(staff_id, performed_at desc);

create table service_record_photos (
  id uuid primary key default gen_random_uuid(),
  service_record_id uuid not null references service_records(id) on delete cascade,
  storage_path text not null,
  kind text not null check (kind in ('before','after','progress')),
  consent_id uuid references client_consents(id),
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ============== PAGAMENTOS ==============

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount_cents int not null check (amount_cents >= 0),
  status payment_status not null default 'pending',
  provider text not null default 'mercadopago',
  provider_payment_id text,
  pix_qr_code text,
  pix_qr_base64 text,
  pix_copy_paste text,
  expires_at timestamptz,
  paid_at timestamptz,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_booking_idx on payments(booking_id);
create index payments_provider_idx on payments(provider_payment_id);

-- ============== COMUNICAÇÕES ==============

create table communications_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  booking_id uuid references bookings(id) on delete set null,
  channel text not null check (channel in ('email','sms','whatsapp','push')),
  template text not null,
  status text not null check (status in ('queued','sent','delivered','opened','failed')),
  payload jsonb,
  error text,
  sent_at timestamptz default now()
);
create index communications_log_client_idx on communications_log(client_id, sent_at desc);

-- ============== TRIGGERS ==============

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'units','service_categories','services','staff',
    'clients','bookings','payments'
  ]) loop
    execute format(
      'create trigger trg_%I_updated_at before update on %I for each row execute function set_updated_at()',
      t, t
    );
  end loop;
end$$;

-- Audit trail automático para mudança de status
create or replace function log_booking_status_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into booking_history (booking_id, from_status, to_status, changed_by, occurred_at)
    values (new.id, case when tg_op = 'INSERT' then null else old.status end, new.status, auth.uid(), now());
  end if;
  return new;
end;
$$;

create trigger trg_booking_status_history
after insert or update of status on bookings
for each row execute function log_booking_status_change();

-- ============== RLS POLICIES ==============

alter table units enable row level security;
alter table service_categories enable row level security;
alter table services enable row level security;
alter table staff enable row level security;
alter table staff_services enable row level security;
alter table staff_units enable row level security;
alter table working_hours enable row level security;
alter table time_off enable row level security;
alter table clients enable row level security;
alter table client_consents enable row level security;
alter table bookings enable row level security;
alter table booking_history enable row level security;
alter table service_records enable row level security;
alter table service_record_photos enable row level security;
alter table payments enable row level security;
alter table communications_log enable row level security;

-- Catálogo público (leitura): todos podem ler unidades, categorias, serviços, staff (sem dados privados)
create policy "public read units" on units for select using (deleted_at is null and is_active);
create policy "public read service_categories" on service_categories for select using (true);
create policy "public read services" on services for select using (deleted_at is null and is_active);
create policy "public read staff_public" on staff for select using (deleted_at is null and is_active);
create policy "public read staff_services" on staff_services for select using (true);
create policy "public read staff_units" on staff_units for select using (true);
create policy "public read working_hours" on working_hours for select using (true);

-- Helper: pega o role do usuário autenticado a partir da tabela staff
create or replace function is_staff_role(roles staff_role[])
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from staff
    where user_id = auth.uid()
      and is_active and deleted_at is null
      and role = any(roles)
  );
$$;

-- Bookings: cliente vê os seus; equipe vê conforme role
create policy "clients see own bookings" on bookings for select
  using (
    exists (select 1 from clients c where c.id = bookings.client_id and c.user_id = auth.uid())
  );

create policy "staff see bookings" on bookings for select
  using (is_staff_role(array['admin','manager','receptionist']::staff_role[]));

create policy "stylist sees own bookings" on bookings for select
  using (
    exists (select 1 from staff s where s.id = bookings.staff_id and s.user_id = auth.uid())
  );

create policy "anon and clients create booking" on bookings for insert
  with check (true); -- inserção controlada pela API com service role

create policy "staff updates bookings" on bookings for update
  using (is_staff_role(array['admin','manager','receptionist']::staff_role[]));

-- Clients: usuário vê o próprio registro; equipe vê todos
create policy "client sees self" on clients for select
  using (user_id = auth.uid());

create policy "staff sees clients" on clients for select
  using (is_staff_role(array['admin','manager','receptionist','stylist']::staff_role[]));

create policy "anon create client" on clients for insert with check (true);

-- Consents: pertencem ao cliente
create policy "client manages own consents" on client_consents for all
  using (
    exists (select 1 from clients c where c.id = client_consents.client_id and c.user_id = auth.uid())
  );

create policy "staff sees consents" on client_consents for select
  using (is_staff_role(array['admin','manager']::staff_role[]));

create policy "anon record consent" on client_consents for insert with check (true);

-- Payments: cliente vê os próprios; equipe vê todos
create policy "client sees own payments" on payments for select
  using (
    exists (
      select 1 from bookings b
      join clients c on c.id = b.client_id
      where b.id = payments.booking_id and c.user_id = auth.uid()
    )
  );

create policy "staff sees payments" on payments for select
  using (is_staff_role(array['admin','manager']::staff_role[]));

-- Service records: equipe gerencia; cliente vê o histórico próprio
create policy "client sees own records" on service_records for select
  using (
    exists (select 1 from clients c where c.id = service_records.client_id and c.user_id = auth.uid())
  );

create policy "staff manages records" on service_records for all
  using (is_staff_role(array['admin','manager','stylist','receptionist']::staff_role[]));

create policy "staff manages record photos" on service_record_photos for all
  using (is_staff_role(array['admin','manager','stylist']::staff_role[]));

-- Communications log: só equipe
create policy "staff sees communications" on communications_log for select
  using (is_staff_role(array['admin','manager']::staff_role[]));

-- Booking history: só equipe
create policy "staff sees booking history" on booking_history for select
  using (is_staff_role(array['admin','manager']::staff_role[]));

-- Time off: equipe gerencia
create policy "staff manages time off" on time_off for all
  using (is_staff_role(array['admin','manager','stylist']::staff_role[]));
