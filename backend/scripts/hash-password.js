require('dotenv').config();
const { hashPassword } = require('../utils/hash');

async function main() {
  const plain = process.argv[2];

  if (!plain) {
    console.error('Uso: node scripts/hash-password.js <password>');
    process.exit(1);
  }

  const hash = await hashPassword(plain);
  console.log(hash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
