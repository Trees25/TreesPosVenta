const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_APP_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_APP_SUPABASE_ANON_KEY=(.*)/);

async function main() {
  if(urlMatch && keyMatch) {
    const url = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
    
    // Check planes
    try {
      const rp = await fetch(url + '/rest/v1/planes?select=id,nombre', { headers: { apikey: key } });
      const planes = await rp.json();
      console.log('Planes:', planes);
    } catch(e) {}
    
    // Check roles
    try {
      const rr = await fetch(url + '/rest/v1/roles?select=id,nombre', { headers: { apikey: key } });
      const roles = await rr.json();
      console.log('Roles:', roles);
    } catch(e) {}
  }
}
main();
