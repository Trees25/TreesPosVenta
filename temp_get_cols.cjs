const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error("No existe el archivo .env");
    process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf-8');
let url = '';
let key = '';

envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (k === 'VITE_SUPABASE_URL') url = v;
        if (k === 'VITE_SUPABASE_ANON_KEY') key = v;
    }
});

if(!url || !key) {
    console.error("No se encontraron url/key en el .env");
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    console.log("Conectando a:", url);
    const { data, error } = await supabase.from('empresa').select('*').limit(1);
    if (error) {
        console.error("Error query:", error);
    } else {
        console.log("DATA_ROW:", data[0]);
        console.log("COLUMNAS:", Object.keys(data[0] || {}).join(', '));
    }
}

test();
