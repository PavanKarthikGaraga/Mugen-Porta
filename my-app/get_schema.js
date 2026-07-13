const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  if (!line.includes('=')) return acc;
  const idx = line.indexOf('=');
  const key = line.substring(0, idx).trim();
  const val = line.substring(idx + 1).trim().replace(/['"]/g, '');
  acc[key] = val;
  return acc;
}, {});
console.log(env.DB_HOST, env.DB_USER, env.DB_PASSWORD ? 'HAS_PASSWORD' : 'NO_PASSWORD', env.DB_NAME);
