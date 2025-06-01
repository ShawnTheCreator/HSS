const bcrypt = require('bcryptjs');

(async () => {
  const password = 'AdminPass123!';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
})();
