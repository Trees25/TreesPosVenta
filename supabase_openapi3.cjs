const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_APP_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_APP_SUPABASE_ANON_KEY=(.*)/);

async function main() {
  if(urlMatch && keyMatch) {
    const url = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
    try {
      const r = await fetch(url + '/rest/v1/', { headers: { apikey: key } });
      const data = await r.json();
      const output = {};
      const tables = ['suscripciones', 'planes'];
      tables.forEach(t => {
        if(data.definitions && data.definitions[t]) {
           output[t] = data.definitions[t];
        } else if(data.components && data.components.schemas && data.components.schemas[t]) {
           output[t] = data.components.schemas[t];
        }
      });
      fs.writeFileSync('schema3.json', JSON.stringify(output, null, 2), 'utf8');
      
      const rp = await fetch(url + '/rest/v1/planes?select=id,nombre', { headers: { apikey: key } });
      const planes = await rp.json();
      console.log('Planes in DB:', planes);
    } catch(e) {
      console.error(e);
    }
  }
}
main();
