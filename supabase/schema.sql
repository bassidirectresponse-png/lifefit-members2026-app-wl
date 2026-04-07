-- =============================================
-- Life Fit Members — Schema SQL
-- Execute no Supabase SQL Editor
-- =============================================

-- Profiles (estende auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nome text not null default '',
  avatar_url text,
  data_inicio_jornada timestamptz not null default now(),
  ativo boolean not null default true,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

-- Módulos (semanas)
create table public.modulos (
  id uuid primary key default gen_random_uuid(),
  numero_semana int unique not null,
  titulo text not null,
  subtitulo text not null default '',
  descricao text not null default '',
  banner_url text,
  cor_destaque text default '#EC4899',
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Aulas (conteúdos dentro de cada semana)
create table public.aulas (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null references public.modulos on delete cascade,
  titulo text not null,
  descricao text not null default '',
  tipo text not null check (tipo in ('video', 'pdf', 'audio', 'link', 'checklist', 'texto')),
  conteudo_url text,
  conteudo_extra jsonb,
  duracao_min int,
  ordem int not null default 0,
  thumbnail_url text
);

-- Progresso de aulas por usuária
create table public.progresso (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  aula_id uuid not null references public.aulas on delete cascade,
  concluida boolean not null default false,
  concluida_em timestamptz,
  unique(user_id, aula_id)
);

-- Progresso de itens de checklist
create table public.checklist_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  aula_id uuid not null references public.aulas on delete cascade,
  item_index int not null,
  marcado boolean not null default false,
  unique(user_id, aula_id, item_index)
);

-- =============================================
-- Indexes
-- =============================================
create index idx_aulas_modulo on public.aulas(modulo_id);
create index idx_progresso_user on public.progresso(user_id);
create index idx_progresso_aula on public.progresso(aula_id);
create index idx_checklist_user_aula on public.checklist_progress(user_id, aula_id);
create index idx_modulos_ordem on public.modulos(ordem);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Usuária vê só o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuária edita só o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin vê todos os perfis"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin edita qualquer perfil"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin insere perfis"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Módulos — leitura pra todos autenticados, escrita só admin
alter table public.modulos enable row level security;

create policy "Autenticados leem módulos"
  on public.modulos for select
  using (auth.uid() is not null);

create policy "Admin gerencia módulos"
  on public.modulos for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Aulas — leitura pra autenticados, escrita só admin
alter table public.aulas enable row level security;

create policy "Autenticados leem aulas"
  on public.aulas for select
  using (auth.uid() is not null);

create policy "Admin gerencia aulas"
  on public.aulas for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Progresso — cada usuária só os seus
alter table public.progresso enable row level security;

create policy "Usuária vê próprio progresso"
  on public.progresso for select
  using (auth.uid() = user_id);

create policy "Usuária gerencia próprio progresso"
  on public.progresso for all
  using (auth.uid() = user_id);

create policy "Admin vê todo progresso"
  on public.progresso for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Checklist progress — cada usuária só os seus
alter table public.checklist_progress enable row level security;

create policy "Usuária vê próprio checklist"
  on public.checklist_progress for select
  using (auth.uid() = user_id);

create policy "Usuária gerencia próprio checklist"
  on public.checklist_progress for all
  using (auth.uid() = user_id);

-- =============================================
-- Trigger: criar profile automaticamente ao registrar
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- Storage bucket para banners e PDFs
-- =============================================
insert into storage.buckets (id, name, public)
values ('content', 'content', true)
on conflict do nothing;

create policy "Acesso público de leitura ao storage"
  on storage.objects for select
  using (bucket_id = 'content');

create policy "Admin faz upload"
  on storage.objects for insert
  with check (
    bucket_id = 'content' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin deleta do storage"
  on storage.objects for delete
  using (
    bucket_id = 'content' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
