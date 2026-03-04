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

    // 1. VALIDACIÓN INICIAL DE PARÁMETROS
    if (!external_reference || !payment_id) {
        return Response.redirect(`${FRONTEND_URL}/?status=failure&error=missing_data`, 302)
    }

    try {
        if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Faltan variables de entorno en el servidor.");
        }

        // 2. VERIFICACIÓN SERVER-TO-SERVER (Mercado Pago API)
        // CRÍTICO: No confiamos en el 'status' de la URL, lo verificamos directamente con MP.
        const mpVerifyResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
        });

        const paymentBody = await mpVerifyResponse.json();

        if (!mpVerifyResponse.ok || paymentBody.status !== "approved") {
            console.error("Pago no válido según Mercado Pago:", paymentBody);
            return Response.redirect(`${FRONTEND_URL}/?status=failure&error=payment_not_approved`, 302)
        }

        // Validar que la referencia externa coincida
        if (paymentBody.external_reference !== external_reference) {
            throw new Error("La referencia del pago no coincide con la esperada.");
        }

        // 3. PROCESAMIENTO DE METADATOS
        const [id_suscripcion, id_plan, id_empresa] = external_reference.split("|")
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Obtener detalles del plan
        const { data: planData } = await supabaseClient
            .from('planes')
            .select('frecuencia')
            .eq('id', Number(id_plan))
            .single()

        // Calcular fecha de fin
        const fecha_fin = new Date()
        if (planData?.frecuencia === 'anual') {
            fecha_fin.setFullYear(fecha_fin.getFullYear() + 1)
        } else {
            fecha_fin.setMonth(fecha_fin.getMonth() + 1)
        }

        // 4. ACTUALIZACIÓN DE SUSCRIPCIÓN
        let errorSus;
        if (id_suscripcion === "nueva") {
            // Obtener el id_auth del admin para la nueva suscripción
            const { data: userData } = await supabaseClient
                .from('usuarios')
                .select('id_auth')
                .eq('id_empresa', Number(id_empresa))
                .eq('id_rol', (await supabaseClient.from('roles').select('id').eq('nombre', 'admin').single()).data?.id || 1)
                .maybeSingle();

            const { error } = await supabaseClient
                .from('suscripciones')
                .insert({
                    id_auth: userData?.id_auth,
                    id_empresa: Number(id_empresa),
                    estado: 'activo',
                    id_plan: Number(id_plan),
                    fecha_fin: fecha_fin.toISOString(),
                    preapproval_id: payment_id,
                    payer_email: paymentBody.payer?.email
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
                    payer_email: paymentBody.payer?.email
                })
                .eq('id', Number(id_suscripcion));
            errorSus = error;
        }

        if (errorSus) throw errorSus

        // 5. ACTUALIZAR PLAN EN TABLA EMPRESA
        const { error: errorEmp } = await supabaseClient
            .from('empresa')
            .update({ id_plan: Number(id_plan) })
            .eq('id', Number(id_empresa))

        if (errorEmp) console.error("Error actualizando empresa:", errorEmp.message)

        return Response.redirect(`${FRONTEND_URL}/?status=success`, 302)

    } catch (error) {
        console.error("Error crítico en pago-exitoso:", error.message)
        return Response.redirect(`${FRONTEND_URL}/?status=error&msg=${encodeURIComponent(error.message)}`, 302)
    }
})
