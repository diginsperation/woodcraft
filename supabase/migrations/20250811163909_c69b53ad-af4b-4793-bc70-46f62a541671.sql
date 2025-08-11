-- Fix linter: set search_path on all functions
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.slugify(input text)
returns text
language plpgsql
set search_path = public
as $$
begin
  if input is null then
    return null;
  end if;
  input := replace(replace(replace(replace(replace(replace(lower(input), 'ä','ae'), 'ö','oe'), 'ü','ue'), 'ß','ss'), 'Ä','ae'), 'Ö','oe');
  input := replace(replace(input, 'Ü','ue'), 'ẞ','ss');
  input := regexp_replace(input, '[^a-z0-9]+', '-', 'g');
  input := regexp_replace(input, '(^-+|-+$)', '', 'g');
  return input;
end;
$$;

create or replace function public.ensure_unique_category_slug(base text)
returns text
language plpgsql
set search_path = public
as $$
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

create or replace function public.ensure_unique_product_slug(base text)
returns text
language plpgsql
set search_path = public
as $$
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

create or replace function public.categories_generate_slug()
returns trigger
language plpgsql
set search_path = public
as $$
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
$$;

create or replace function public.products_generate_slug()
returns trigger
language plpgsql
set search_path = public
as $$
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
$$;