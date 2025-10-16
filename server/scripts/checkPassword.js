const bcrypt = require('bcryptjs');
const storedHash = '$2a$10$B6CBI4xamHyeIPYIsLDtFu/MasEz6to3MyaCGirsRHa5n2wZuSAgK';
(async () => {
  const ok = await bcrypt.compare('password123', storedHash);
  console.log('bcrypt compare result:', ok);
})();
