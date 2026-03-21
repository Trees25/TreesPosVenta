const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_APP_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_APP_SUPABASE_ANON_KEY=(.*)/);

async function main() {
  if(urlMatch && keyMatch) {
    const url = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
    try {
      const rp = await fetch(url + '/rest/v1/planes?select=id,nombre', { headers: { apikey: key } });
      const planes = await rp.json();
      fs.writeFileSync('planes.json', JSON.stringify(planes, null, 2));
    } catch(e) {
      console.error(e);
    }
  }
}
main();
