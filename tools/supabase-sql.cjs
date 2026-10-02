// Corre SQL en el proyecto de Supabase usando la API de gestión.
// Uso:  node tools/supabase-sql.cjs "select count(*) from propiedades"
// Requiere la variable de entorno SUPABASE_ACCESS_TOKEN (token personal sbp_..., NUNCA en el repo).
const { execSync } = require('child_process');

const REF = 'xnzfyklewwmibncryrei';
let token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token && process.platform === 'win32') {
  token = execSync(`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('SUPABASE_ACCESS_TOKEN','User')"`).toString().trim();
}
if (!token) { console.error('Falta la variable de entorno SUPABASE_ACCESS_TOKEN'); process.exit(1); }

const query = process.argv[2];
if (!query) { console.error('Uso: node tools/supabase-sql.cjs "<sql>"'); process.exit(1); }

(async () => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const body = await res.text();
  if (!res.ok) { console.error(res.status, body); process.exit(1); }
  console.log(JSON.stringify(JSON.parse(body), null, 2));
})();
