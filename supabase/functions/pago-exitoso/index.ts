import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || "http://localhost:5173"

serve(async (req) => {
    const url = new URL(req.url)
    const preapproval_id = url.searchParams.get('preapproval_id')

    if (!preapproval_id) {
        return Response.redirect(`${FRONTEND_URL}/?status=failure`, 302)
    }

    try {
        // 1. Consultar estado en Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapproval_id}`, {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
        })
        const mpData = await mpResponse.json()

        if (mpData.status !== "authorized") {
            return Response.redirect(`${FRONTEND_URL}/?status=failure`, 302)
        }

        // 2. Extraer metadatos
        const [id_suscripcion, id_plan] = mpData.external_reference.split("|")
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Calcular fecha de fin (Sumar 1 mes a la fecha de inicio del cobro)
        const fecha_fin = mpData.next_payment_date ? new Date(mpData.next_payment_date) : new Date()
        if (!mpData.next_payment_date) {
            fecha_fin.setMonth(fecha_fin.getMonth() + 1)
        }

        // 3. ACTUALIZACIÓN DOBLE: Suscripciones y Empresa
        // A) Actualizar tabla suscripciones
        const { error: errorSus } = await supabaseClient
            .from('suscripciones')
            .update({
                estado: 'activa',
                id_plan: Number(id_plan),
                fin: fecha_fin.toISOString(),
                preapproval_id: preapproval_id,
                payer_email: mpData.payer_email
            })
            .eq('id', Number(id_suscripcion))
            .select('id_auth')
            .maybeSingle()

        if (errorSus) throw errorSus

        // B) Actualizar tabla empresa para desbloquear el acceso (id_plan)
        // El id_auth nos ayuda a identificar la empresa del usuario
        const { data: dataSuscripcion } = await supabaseClient
            .from('suscripciones')
            .select('id_auth')
            .eq('id', Number(id_suscripcion))
            .maybeSingle()

        if (dataSuscripcion?.id_auth) {
            const { error: errorEmp } = await supabaseClient
                .from('empresa')
                .update({ id_plan: Number(id_plan) })
                .eq('id_auth', dataSuscripcion.id_auth)

            if (errorEmp) console.error("Error actualizando empresa:", errorEmp.message)
        }

        return Response.redirect(`${FRONTEND_URL}/planes?status=success`, 302)

    } catch (error) {
        console.error("Error en pago-exitoso:", error.message)
        return Response.redirect(`${FRONTEND_URL}/planes?status=error`, 302)
    }
})
