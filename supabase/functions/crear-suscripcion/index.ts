import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Manejo de CORS con cabeceras explícitas
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const { email, plan_nombre, monto, id_suscripcion_id_plan } = body

        if (!MP_ACCESS_TOKEN) {
            return new Response(
                JSON.stringify({ error: "Falta MP_ACCESS_TOKEN en los secretos de Supabase." }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // Payload para Mercado Pago Checkout Pro (Preferencias)
        const mpPayload = {
            items: [
                {
                    title: plan_nombre || "Suscripción PosVenta",
                    quantity: 1,
                    unit_price: Number(monto),
                    currency_id: "ARS"
                }
            ],
            payer: {
                email: email
            },
            back_urls: {
                success: `${SUPABASE_URL}/functions/v1/pago-exitoso`,
                failure: `${SUPABASE_URL}/functions/v1/pago-exitoso`,
                pending: `${SUPABASE_URL}/functions/v1/pago-exitoso`
            },
            auto_return: "all",
            external_reference: id_suscripcion_id_plan,
        }

        console.log("Invocando MP con:", JSON.stringify(mpPayload));

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mpPayload),
        })

        const mpData = await mpResponse.json()

        if (!mpResponse.ok) {
            console.error("Error devuelto por MP:", mpData);
            const detailMsg = mpData.message || mpData.cause?.[0]?.description || JSON.stringify(mpData);
            return new Response(
                JSON.stringify({ error: `Mercado Pago rechazó: ${detailMsg}`, details: mpData }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        return new Response(
            JSON.stringify({ init_point: mpData.init_point }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error("Error crítico en la Edge Function:", error.message);
        return new Response(
            JSON.stringify({ error: `Error interno de la función: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
