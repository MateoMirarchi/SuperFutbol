-- Schema SQL para Supabase / PostgreSQL
-- Ejecutar en el SQL Editor de Supabase.

create table if not exists admins (
  id serial primary key,
  email varchar(100) unique not null,
  usuario varchar(50) unique not null,
  password varchar(200) not null,
  created_at timestamptz default now()
);

create table if not exists equipos (
  id serial primary key,
  nombre varchar(100) not null,
  nombre_corto varchar(5) not null,
  ciudad varchar(100) default '',
  liga_id varchar(10) not null,
  liga_nombre varchar(100) not null,
  division integer not null check (division between 1 and 4),
  division_nombre varchar(100) not null,
  prestigio integer not null check (prestigio between 1 and 99),
  color_primario varchar(7) not null,
  color_secundario varchar(7) not null,
  created_at timestamptz default now()
);

create table if not exists jugadores (
  id serial primary key,
  equipo_id integer not null references equipos(id) on delete cascade,
  nombre varchar(80) not null,
  apellido varchar(80) not null,
  posicion varchar(3) not null check (posicion in ('GK', 'LB', 'RB', 'CB', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'ST', 'RW', 'LW')),
  edad integer not null check (edad between 14 and 45),
  potencia integer not null check (potencia between 1 and 99),
  valor bigint not null default 1000000,
  sueldo integer not null default 80000,
  fin_contrato_temp integer not null default 3 check (fin_contrato_temp between 1 and 20),
  estado varchar(20) not null default 'available' check (estado in ('available', 'injured', 'suspended', 'loan')),
  nacionalidad varchar(80) default ''
);

create index if not exists idx_jugadores_equipo_id on jugadores(equipo_id);
create index if not exists idx_equipos_liga_division on equipos(liga_id, division);
