// Llama a una herramienta del MCP de n8n desde la terminal (sin necesidad de reiniciar la app).
// Uso:  node tools/n8n.cjs <herramienta> '<json>'      o      node tools/n8n.cjs <herramienta> @archivo.json
// Ejemplos:
//   node tools/n8n.cjs get_instance_context
//   node tools/n8n.cjs get_workflow_details '{"workflowId":"X4eNosiuZRg7wHL0","detailLevel":"full"}'
// Requiere la variable de entorno N8N_MCP_TOKEN (token personal de cada persona, NUNCA en el repo).
const fs = require('fs');
const { execSync } = require('child_process');

const URL = process.env.N8N_MCP_URL || 'https://propertymatchia.app.n8n.cloud/mcp-server/http';
let token = process.env.N8N_MCP_TOKEN;
if (!token && process.platform === 'win32') {
  token = execSync(`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('N8N_MCP_TOKEN','User')"`).toString().trim();
}
if (!token) { console.error('Falta la variable de entorno N8N_MCP_TOKEN'); process.exit(1); }

const [tool, argStr] = process.argv.slice(2);
if (!tool) { console.error('Uso: node tools/n8n.cjs <herramienta> [json|@archivo]'); process.exit(1); }
const args = argStr ? JSON.parse(argStr.startsWith('@') ? fs.readFileSync(argStr.slice(1), 'utf8') : argStr) : {};

(async () => {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: tool, arguments: args } })
  });
  const text = await res.text();
  const line = text.split('\n').find(l => l.startsWith('data:'));
  const out = JSON.parse(line ? line.slice(5) : text);
  if (out.error) { console.error('ERROR', JSON.stringify(out.error, null, 2)); process.exit(1); }
  for (const c of out.result.content || []) console.log(c.text);
  if (out.result.isError) process.exit(1);
})();
