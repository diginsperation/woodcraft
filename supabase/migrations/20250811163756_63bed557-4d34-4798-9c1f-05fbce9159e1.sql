-- 3a: Catalog, Roles, Profiles, RLS, Triggers, Slug generation, Seeds
-- 0) Extensions
create extension if not exists pgcrypto;

-- A) Roles
create type public.app_role as enum ('admin','editor','viewer');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles (prevents recursive RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id and ur.role = _role
  );
$$;

-- RLS for user_roles
-- Only admins can select/modify user_roles; users can read their own roles
create policy "Users can read their own roles" on public.user_roles
for select to authenticated
using (auth.uid() = user_id);

create policy "Admins can read all roles" on public.user_roles
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles" on public.user_roles
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- B) Profiles (stores display name and must_change_password flag)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS for profiles: users read/update their own; admins can read/update all
create policy "Users can read own profile" on public.profiles
for select to authenticated
using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
for update to authenticated
using (auth.uid() = id);

create policy "Admins can read all profiles" on public.profiles
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update all profiles" on public.profiles
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger function (generic)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- C) Slugify helpers
create or replace function public.slugify(input text)
returns text
language plpgsql as $$
-- IMPORTANT: Slugs must be lower-case, umlauts replaced, special chars removed, words joined by '-'
-- Conflict resolution will be handled by separate functions per table
begin
  if input is null then
    return null;
  end if;
  -- Replace German umlauts and ß
  input := replace(replace(replace(replace(replace(replace(lower(input), 'ä','ae'), 'ö','oe'), 'ü','ue'), 'ß','ss'), 'Ä','ae'), 'Ö','oe');
  input := replace(replace(input, 'Ü','ue'), 'ẞ','ss');
  -- Replace non-alphanumeric with dashes
  input := regexp_replace(input, '[^a-z0-9]+', '-', 'g');
  -- Trim dashes
  input := regexp_replace(input, '(^-+|-+$)', '', 'g');
  return input;
end;
$$;

-- Ensure unique slug for categories
create or replace function public.ensure_unique_category_slug(base text)
returns text
language plpgsql as $$
declare
  candidate text := base;
  i int := 1;
begin
  if candidate is null or candidate = '' then
    candidate := 'category';
  end if;
  while exists (select 1 from public.categories where slug = candidate) loop
    i := i + 1;
    candidate := base || '-' || i::text;
  end loop;
  return candidate;
end;
$$;

-- Ensure unique slug for products
create or replace function public.ensure_unique_product_slug(base text)
returns text
language plpgsql as $$
declare
  candidate text := base;
  i int := 1;
begin
  if candidate is null or candidate = '' then
    candidate := 'product';
  end if;
  while exists (select 1 from public.products where slug = candidate) loop
    i := i + 1;
    candidate := base || '-' || i::text;
  end loop;
  return candidate;
end;
$$;

-- D) Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- Triggers: updated_at, slug auto-generate on insert/update when name changes or slug null
create or replace function public.categories_generate_slug()
returns trigger as $$
declare
  base text;
  desired text;
begin
  if tg_op = 'INSERT' then
    if new.slug is null or new.slug = '' then
      base := public.slugify(new.name);
      new.slug := public.ensure_unique_category_slug(base);
    else
      new.slug := public.ensure_unique_category_slug(public.slugify(new.slug));
    end if;
  elsif tg_op = 'UPDATE' then
    if new.slug is distinct from old.slug then
      new.slug := public.ensure_unique_category_slug(public.slugify(new.slug));
    elsif new.name is distinct from old.name and (new.slug is null or new.slug = old.slug) then
      base := public.slugify(new.name);
      desired := public.ensure_unique_category_slug(base);
      new.slug := desired;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger categories_slug_trigger
before insert or update on public.categories
for each row execute function public.categories_generate_slug();

-- RLS: public read; write only admin/editor
create policy "Public can read categories" on public.categories
for select using (true);

create policy "Editors can insert categories" on public.categories
for insert to authenticated
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create policy "Editors can update categories" on public.categories
for update to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create policy "Editors can delete categories" on public.categories
for delete to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- E) Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null unique,
  title text not null,
  description text,
  base_price numeric(10,2) not null,
  active boolean not null default true,
  seo_title text,
  seo_description text,
  details jsonb,
  youtube_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Slug trigger for products
create or replace function public.products_generate_slug()
returns trigger as $$
declare
  base text;
  desired text;
begin
  if tg_op = 'INSERT' then
    if new.slug is null or new.slug = '' then
      base := public.slugify(new.title);
      new.slug := public.ensure_unique_product_slug(base);
    else
      new.slug := public.ensure_unique_product_slug(public.slugify(new.slug));
    end if;
  elsif tg_op = 'UPDATE' then
    if new.slug is distinct from old.slug then
      new.slug := public.ensure_unique_product_slug(public.slugify(new.slug));
    elsif new.title is distinct from old.title and (new.slug is null or new.slug = old.slug) then
      base := public.slugify(new.title);
      desired := public.ensure_unique_product_slug(base);
      new.slug := desired;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger products_slug_trigger
before insert or update on public.products
for each row execute function public.products_generate_slug();

-- RLS: public read; write only admin/editor; only active visible to public?
-- Requirement says public SELECT allowed (no active filter in RLS). We'll filter by active in app.
create policy "Public can read products" on public.products
for select using (true);

create policy "Editors can insert products" on public.products
for insert to authenticated
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create policy "Editors can update products" on public.products
for update to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create policy "Editors can delete products" on public.products
for delete to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- F) Seed data (idempotent upserts by slug)
insert into public.categories (name, description, sort_order, slug)
values
  ('Geschenke', 'Ausgewählte Geschenkideen aus Holz', 1, 'geschenke'),
  ('Servierbretter', 'Edle Servierbretter für jeden Anlass', 2, 'servierbretter'),
  ('Schneidebretter', 'Robuste Schneidebretter für die Küche', 3, 'schneidebretter'),
  ('Deko', 'Zeitlose Dekoobjekte aus Holz', 4, 'deko')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Products referencing categories via slug
with cat as (
  select id, slug from public.categories
)
insert into public.products (category_id, slug, title, description, base_price, active, youtube_url)
values
  ((select id from cat where slug='schneidebretter'), 'personalisierbares-schneidebrett-eiche', 'Personalisierbares Schneidebrett Eiche', 'Massives Eichenbrett mit optionaler Gravur.', 59.00, true, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  ((select id from cat where slug='servierbretter'), 'servierbrett-walnuss-mit-griff', 'Servierbrett Walnuss mit Griff', 'Dunkles Walnussbrett mit ergonomischem Griff.', 69.00, true, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  ((select id from cat where slug='geschenke'), 'graviertes-geschenkbrett-herz', 'Graviertes Geschenkbrett Herz', 'Herzförmiges Motiv mit individueller Gravur.', 49.00, true, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  ((select id from cat where slug='deko'), 'kerzenhalter-buche', 'Kerzenhalter Buche', 'Schlichter Kerzenhalter aus Buchenholz.', 29.00, true, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
ON CONFLICT (slug) DO UPDATE SET
  category_id = excluded.category_id,
  title = excluded.title,
  description = excluded.description,
  base_price = excluded.base_price,
  active = excluded.active,
  youtube_url = excluded.youtube_url;
