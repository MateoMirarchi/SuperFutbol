/**
 * scripts/rehash-plaintext-passwords.js
 *
 * Migracion puntual: busca admins cuya columna `password` no tiene forma de
 * hash bcrypt (es decir, quedo guardada en texto plano de antes de que
 * verifyPassword() aceptara ese fallback) y la rehashea con bcrypt
 * (SALT_ROUNDS=12, la misma funcion hashPassword() que usa el resto del
 * sistema). No modifica nada mas de la fila.
 *
 * Por defecto corre en modo dry-run: solo informa que filas migraria, sin
 * escribir en la base. Pasar --apply para aplicar los cambios de verdad.
 *
 * Uso:
 *   node scripts/rehash-plaintext-passwords.js            (dry-run)
 *   node scripts/rehash-plaintext-passwords.js --apply    (aplica)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabase = require('../services/supabase');
const { hashPassword } = require('../utils/hash');

const BCRYPT_HASH_PATTERN = /^\$2[aby]?\$/;

async function main() {
  const apply = process.argv.includes('--apply');

  const { data: admins, error } = await supabase
    .from('admins')
    .select('id, usuario, email, password');

  if (error) throw error;

  const plaintextAdmins = (admins ?? []).filter(
    (admin) => typeof admin.password === 'string' && !BCRYPT_HASH_PATTERN.test(admin.password)
  );

  if (!plaintextAdmins.length) {
    console.log('No se encontraron admins con password en texto plano. Nada que migrar.');
    return;
  }

  console.log(
    `Se encontraron ${plaintextAdmins.length} admin(s) con password en texto plano: ` +
    plaintextAdmins.map((a) => `#${a.id} (${a.usuario})`).join(', ')
  );

  if (!apply) {
    console.log('Modo dry-run: no se modifico nada. Volver a correr con --apply para rehashear de verdad.');
    return;
  }

  for (const admin of plaintextAdmins) {
    const newHash = await hashPassword(admin.password);
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password: newHash })
      .eq('id', admin.id);

    if (updateError) {
      console.error(`Error al migrar admin #${admin.id}:`, updateError.message);
      continue;
    }
    console.log(`Admin #${admin.id} (${admin.usuario}) migrado a bcrypt.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
