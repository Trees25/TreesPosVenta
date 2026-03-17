import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'TU_URL_AQUI_O_EXTRAER_DE_ENV';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'TU_KEY_AQUI_O_EXTRAER_DE_ENV';

// Vamos a leer el archivo .env asumiendo que está en la misma carpeta
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.join('=').trim().replace(/"/g, '');
    }
});

const url = envVars.VITE_SUPABASE_URL;
const key = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function test() {
    const { data, error } = await supabase.from('empresa').select('*').limit(1);
    if (error) console.error("Error:", error);
    else console.log(Object.keys(data[0] || {}));
}

test();
