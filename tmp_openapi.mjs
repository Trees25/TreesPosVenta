import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync('f:/Proyectos/pos-ventas/pos-ventas-18-06-2025/.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.join('=').trim().replace(/\"/g, '');
    }
});

const url = envVars.VITE_APP_SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const key = envVars.VITE_APP_SUPABASE_ANON_KEY || envVars.VITE_SUPABASE_ANON_KEY;

fetch(url + '/rest/v1/?apikey=' + key)
  .then(res => res.json())
  .then(data => {
    const api = data.paths['/rpc/upsert_productos_masivo'];
    if(api) {
        fs.writeFileSync('f:/Proyectos/pos-ventas/pos-ventas-18-06-2025/tmp_openapi_result.json', JSON.stringify(api, null, 2));
    } else {
        fs.writeFileSync('f:/Proyectos/pos-ventas/pos-ventas-18-06-2025/tmp_openapi_result.json', '{"error": "not found"}');
    }
  })
  .catch(console.error);
