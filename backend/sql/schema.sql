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

-- ─────────────────────────────────────────────────────────────────────────
-- paises / divisiones
--
-- Estas dos tablas ya las usa el codigo (services/paisesService.js) pero no
-- estaban definidas en este archivo -- el schema entregado no reflejaba el
-- sistema en produccion. Se agregan aqui con la misma estructura de columnas
-- que el codigo ya asume (nombre, pais_id), sumando las constraints que
-- faltaban: UNIQUE en paises.nombre (sin esto, dos POST /paises concurrentes
-- con el mismo nombre nuevo podian crear paises duplicados: el codigo
-- verifica duplicados con un SELECT previo, pero sin UNIQUE en la base eso
-- es una simple carrera, no una garantia) y UNIQUE(pais_id, nombre) en
-- divisiones para que no se puedan insertar divisiones repetidas del mismo
-- pais.
--
-- IMPORTANTE: no se corrio esta migracion contra Supabase. Revisar y
-- ejecutar manualmente -- puede haber datos reales en la base.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists paises (
  id serial primary key,
  nombre varchar(100) unique not null,
  created_at timestamptz default now()
);

create table if not exists divisiones (
  id serial primary key,
  pais_id integer not null references paises(id) on delete cascade,
  nombre varchar(100) not null,
  unique (pais_id, nombre)
);

create index if not exists idx_divisiones_pais_id on divisiones(pais_id);
