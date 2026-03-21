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
      const tables = ['empresa', 'usuarios'];
      tables.forEach(t => {
        if(data.definitions && data.definitions[t]) {
           output[t] = data.definitions[t].properties;
        } else if(data.components && data.components.schemas && data.components.schemas[t]) {
           output[t] = data.components.schemas[t].properties;
        }
      });
      fs.writeFileSync('schema.json', JSON.stringify(output, null, 2), 'utf8');
    } catch(e) {
      console.error(e);
    }
  }
}
main();
