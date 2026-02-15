import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const rawBody = await req.text()
        if (!rawBody) throw new Error("Cuerpo de petición vacío")

        const { email, plan_nombre, monto, id_suscripcion_id_plan } = JSON.parse(rawBody)

        if (!MP_ACCESS_TOKEN) {
            return new Response(JSON.stringify({ error: "Falta MP_ACCESS_TOKEN en Secrets" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        // Payload para Mercado Pago con 30 días de prueba (free_trial)
        const mpPayload = {
            reason: plan_nombre || "Suscripción PosVenta",
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: Number(monto),
                currency_id: "ARS",
                free_trial: {
                    frequency: 1,
                    frequency_type: "months"
                }
            },
            payer_email: email,
            back_url: "https://rmxmggsntujfktlpuauz.supabase.co/functions/v1/pago-exitoso",
            status: "pending",
            external_reference: id_suscripcion_id_plan,
        }

        const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mpPayload),
        })

        const mpData = await mpResponse.json()

        if (!mpResponse.ok) {
            return new Response(
                JSON.stringify({ error: "Error de Mercado Pago", details: mpData }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // Notificar al frontend el punto de inicio
        return new Response(
            JSON.stringify({ init_point: mpData.init_point }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
