-- Migracion 001: funcion atomica para crear un pais + sus 4 divisiones.
--
-- Reemplaza la logica actual de services/paisesService.js:create, que hace
-- dos INSERT secuenciales desde Node (uno a `paises`, otro a `divisiones`)
-- sin ninguna transaccion: si el segundo INSERT fallaba (error de red,
-- constraint, timeout), el pais ya insertado en el primer paso quedaba
-- persistido sin sus 4 divisiones, sin ningun rollback.
--
-- Esta funcion hace ambos INSERT dentro de una unica transaccion de
-- Postgres: las funciones plpgsql corren implicitamente en una transaccion,
-- asi que si cualquier sentencia de adentro lanza una excepcion (por
-- ejemplo, el nombre del pais ya existe y viola el UNIQUE agregado en
-- schema.sql), TODO el efecto de la funcion se revierte automaticamente
-- -- no hace falta ROLLBACK explicito ni manejo especial desde Node.
--
-- Requiere que la migracion de schema.sql (tablas paises/divisiones, con
-- paises.nombre UNIQUE) ya este aplicada.
--
-- Uso desde Node (services/paisesService.js):
--   const { data, error } = await supabase.rpc('crear_pais_con_divisiones', { p_nombre: nombre.trim() });
--   if (error) throw error;
--   return data; // { id, nombre, divisiones: [...] }
--
-- IMPORTANTE: no se ejecuto esta migracion contra Supabase. Revisar y correr
-- manualmente en el SQL Editor -- puede haber datos reales en la base.

create or replace function crear_pais_con_divisiones(p_nombre text)
returns jsonb
language plpgsql
as $$
declare
  v_pais paises%rowtype;
  v_divisiones jsonb;
begin
  insert into paises (nombre)
  values (trim(p_nombre))
  returning * into v_pais;

  insert into divisiones (pais_id, nombre)
  select v_pais.id, 'División ' || n
  from generate_series(1, 4) as n;

  select jsonb_agg(to_jsonb(d.*) order by d.nombre) into v_divisiones
  from divisiones d
  where d.pais_id = v_pais.id;

  return jsonb_build_object(
    'id', v_pais.id,
    'nombre', v_pais.nombre,
    'divisiones', coalesce(v_divisiones, '[]'::jsonb)
  );
end;
$$;
