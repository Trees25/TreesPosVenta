import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || "http://localhost:5173"

Deno.serve(async (req) => {
    const url = new URL(req.url)

    // Parámetros de Checkout Pro
    const status = url.searchParams.get('status') || url.searchParams.get('collection_status')
    const payment_id = url.searchParams.get('payment_id') || url.searchParams.get('collection_id')
    const external_reference = url.searchParams.get('external_reference')

    if (!external_reference || status !== "approved") {
        console.warn("Pago no aprobado o sin referencia:", { status, external_reference });
        return Response.redirect(`${FRONTEND_URL}/?status=failure`, 302)
    }

    try {
        console.log("Procesando pago aprobado:", { payment_id, external_reference });

        // 2. Extraer metadatos
        if (!external_reference.includes("|")) {
            throw new Error("Referencia externa malformada");
        }

        const [id_suscripcion, id_plan, id_empresa] = external_reference.split("|")
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 2.5 Obtener detalles del plan para saber la frecuencia
        const { data: planData } = await supabaseClient
            .from('planes')
            .select('frecuencia')
            .eq('id', Number(id_plan))
            .single()

        // Calcular fecha de fin según frecuencia
        const fecha_fin = new Date()
        if (planData?.frecuencia === 'anual') {
            fecha_fin.setFullYear(fecha_fin.getFullYear() + 1)
        } else {
            fecha_fin.setMonth(fecha_fin.getMonth() + 1)
        }

        console.log(`Activando suscripción ${id_suscripcion} al plan ${id_plan} (${planData?.frecuencia})`);

        // 3. ACTUALIZACIÓN O CREACIÓN: Suscripciones y Empresa
        let errorSus;
        if (id_suscripcion === "nueva") {
            const { data: userData } = await supabaseClient
                .from('usuarios')
                .select('id_auth')
                .eq('id_empresa', Number(id_empresa))
                .eq('id_rol', 1) // Buscamos al admin
                .maybeSingle();

            const { error } = await supabaseClient
                .from('suscripciones')
                .insert({
                    id_auth: userData?.id_auth,
                    id_empresa: Number(id_empresa),
                    estado: 'activo',
                    id_plan: Number(id_plan),
                    fecha_fin: fecha_fin.toISOString(),
                    preapproval_id: payment_id
                });
            errorSus = error;
        } else {
            const { error } = await supabaseClient
                .from('suscripciones')
                .update({
                    estado: 'activo',
                    id_plan: Number(id_plan),
                    fecha_fin: fecha_fin.toISOString(),
                    preapproval_id: payment_id,
                })
                .eq('id', Number(id_suscripcion));
            errorSus = error;
        }

        if (errorSus) throw errorSus

        // B) Actualizar tabla empresa
        const { data: dataSuscripcion } = await supabaseClient
            .from('suscripciones')
            .select('id_empresa')
            .eq('id', Number(id_suscripcion))
            .maybeSingle()

        const empresaId = id_empresa || dataSuscripcion?.id_empresa;
        if (empresaId) {
            const { error: errorEmp } = await supabaseClient
                .from('empresa')
                .update({ id_plan: Number(id_plan) })
                .eq('id', Number(empresaId))

            if (errorEmp) console.error("Error actualizando empresa:", errorEmp.message)
        }

        return Response.redirect(`${FRONTEND_URL}/?status=success`, 302)

    } catch (error) {
        console.error("Error crítico en pago-exitoso:", error.message)
        return Response.redirect(`${FRONTEND_URL}/?status=error&msg=${encodeURIComponent(error.message)}`, 302)
    }
})
