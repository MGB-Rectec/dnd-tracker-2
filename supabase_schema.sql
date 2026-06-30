-- Ejecutar esto en el SQL Editor de Supabase (Project > SQL Editor > New query)

create table if not exists public.combatants (
  id uuid primary key default gen_random_uuid(),
  nombre text not null default 'Sin nombre',
  hp_max integer not null default 10,
  hp integer not null default 10,
  iniciativa integer not null default 0,
  activo boolean not null default false,
  created_at timestamptz not null default now()
);

-- Habilitar Row Level Security
alter table public.combatants enable row level security;

-- Política simple: como es una herramienta de uso privado/mesa de juego,
-- permitimos lectura y escritura pública (sin login). Si querés restringirlo
-- más adelante, reemplazá estas políticas por unas que validen auth.uid().
create policy "Permitir lectura publica" on public.combatants
  for select using (true);

create policy "Permitir insercion publica" on public.combatants
  for insert with check (true);

create policy "Permitir actualizacion publica" on public.combatants
  for update using (true);

create policy "Permitir borrado publico" on public.combatants
  for delete using (true);

-- Habilitar Realtime para esta tabla (para que se sincronice entre dispositivos)
alter publication supabase_realtime add table public.combatants;
