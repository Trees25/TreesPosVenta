const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');

const urlMatch = env.match(/VITE_APP_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_APP_SUPABASE_ANON_KEY=(.*)/);

async function checkCatalog() {
  if (urlMatch && keyMatch) {
    const url = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');

    const headers = { 'apikey': key, 'Authorization': `Bearer ${key}` };

    try {
      const pRes = await fetch(url + '/rest/v1/productos?select=id,nombre,id_empresa&limit=5', { headers });
      const prods = await pRes.json();
      console.log('Productos (Anon Key):', prods);
    } catch (e) {
      console.error(e);
    }
  }
}
checkCatalog();
