const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
let url = '', key = '';

envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (k === 'VITE_APP_SUPABASE_URL') url = v;
        if (k === 'VITE_APP_SUPABASE_ANON_KEY') key = v;
    }
});

const supabase = createClient(url, key);

async function test() {
    const { data: emp, error: e1 } = await supabase.from('empresa').select('*').limit(1);
    console.log("EMPRESA COLUMNS:", emp ? Object.keys(emp[0] || {}).join(', ') : e1);
    
    const { data: usr, error: e2 } = await supabase.from('usuarios').select('*').limit(1);
    console.log("USUARIOS COLUMNS:", usr ? Object.keys(usr[0] || {}).join(', ') : e2);
}

test();
