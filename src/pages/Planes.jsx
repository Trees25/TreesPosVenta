import styled from "styled-components";
import { useState, useEffect } from "react";
import { SuscripcionService } from "../services/SuscripcionService";
import { MercadoPagoService } from "../services/MercadoPagoService";
import { useAuthStore } from "../store/AuthStore";
import { supabase } from "../supabase";
import { toast } from "sonner";
import Swal from "sweetalert2";

export const Planes = () => {
    const { user, profile } = useAuthStore();
    const isAdmin = profile?.id_rol === 1 || profile?.roles?.nombre === 'admin';
    const [planes, setPlanes] = useState([]);
    const [currentSub, setCurrentSub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState("mensual"); // "mensual" o "anual"

    useEffect(() => {
        if (user) {
            fetchData();

            // Verificar si venimos de un pago exitoso
            const params = new URLSearchParams(window.location.search);
            if (params.get("status") === "success") {
                Swal.fire({
                    title: "¡Pago Exitoso! 🎉",
                    text: "Tu plan se ha actualizado correctamente. Ya puedes disfrutar de tus nuevos beneficios.",
                    icon: "success",
                    confirmButtonText: "¡Excelente!",
                    timer: 5000
                });
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // Verificar si la cuenta está suspendida
            if (params.get("suspended") === "true") {
                Swal.fire({
                    title: "Cuenta Suspendida 🚫",
                    text: "Tu cuenta ha sido restringida por falta de pago (más de 30 días de mora). Por favor, selecciona un plan para reactivar tu negocio.",
                    icon: "error",
                    confirmButtonText: "Ver Planes",
                    confirmButtonColor: "#ff6a00"
                });
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Obtener id_empresa (prioridad al perfil cargado, sino fallback a DB)
            let idEmpresa = profile?.id_empresa;

            if (!idEmpresa && user) {
                const { data: usuario, error: userError } = await supabase
                    .from("usuarios")
                    .select("id_empresa")
                    .eq("id_auth", user.id)
                    .maybeSingle();

                if (userError) throw userError;
                idEmpresa = usuario?.id_empresa;
            }

            if (!idEmpresa) {
                console.warn("No se encontró id_empresa para el usuario");
                setCurrentSub(null);
                setPlanes(await SuscripcionService.obtenerPlanes());
                return;
            }

            // 2. Cargar planes y suscripción activa
            const [pList, sub] = await Promise.all([
                SuscripcionService.obtenerPlanes(),
                SuscripcionService.obtenerSuscripcionActiva(idEmpresa)
            ]);

            setPlanes(pList);
            setCurrentSub(sub);
        } catch (error) {
            console.error("Error al cargar datos de planes:", error);
            toast.error("Error al cargar la información de planes");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (plan) => {
        if (currentSub?.id_plan === plan.id && currentSub?.estado === 'activo') {
            return toast.info("Ya tienes este plan activo");
        }

        const diasRestantes = currentSub?.dias_restantes || 0;
        const needsPenalty = diasRestantes < -10;
        const recargo = needsPenalty ? parseFloat(plan.monto) * 0.03 : 0;

        const { isConfirmed } = await Swal.fire({
            title: `<span style="color: #ff6a00; font-weight: 800; font-size: 24px;">${currentSub?.id_plan === plan.id ? 'Renovar' : 'Confirmar'} Suscripción</span>`,
            html: `
                <div style="text-align: left; padding: 10px; font-family: 'Inter', -apple-system, sans-serif;">
                    <p style="color: #666; margin-bottom: 20px; font-size: 14px;">Estás a punto de ${currentSub?.id_plan === plan.id ? 'renovar tu suscripción actual' : 'cambiar a un nuevo nivel de potencia'} para tu negocio.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 20px; border: 1px solid #eee; margin-bottom: 20px; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; right: 0; width: 50px; height: 50px; background: #ff6a0011; border-radius: 0 0 0 50px;"></div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Plan</span>
                            <span style="font-weight: 800; color: #1a1e26; font-size: 16px;">${plan.nombre}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ciclo</span>
                            <span style="font-weight: 700; color: #1a1e26;">${plan.frecuencia.toUpperCase()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Monto</span>
                            <span style="font-weight: 800; color: #1a1e26; font-size: 18px;">$${parseFloat(plan.monto).toLocaleString()}</span>
                        </div>
                    </div>

                    ${needsPenalty ? `
                        <div style="background: #fff5f5; padding: 15px; border-radius: 16px; border: 1px solid #ffdada; margin-bottom: 20px; display: flex; gap: 12px; align-items: flex-start;">
                            <div style="background: #ff5e57; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; margin-top: 2px;">!</div>
                            <div>
                                <div style="font-weight: 800; color: #c53030; font-size: 13px; margin-bottom: 4px;">RECARGO POR MORA (3%)</div>
                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; min-width: 220px;">
                                    <span style="color: #e53e3e; font-size: 12px;">Debido a ${Math.abs(Math.floor(diasRestantes))} días de retraso</span>
                                    <span style="font-weight: 800; color: #c53030;">+$${recargo.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ` : ""}

                    <div style="border-top: 2px solid #f1f1f1; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 16px; font-weight: 600; color: #666;">Total a debitar</span>
                        <span style="font-size: 28px; font-weight: 950; color: #1a1e26; letter-spacing: -1px;">$${(parseFloat(plan.monto) + recargo).toLocaleString()}</span>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Ir a Pagar �",
            cancelButtonText: "Volver",
            confirmButtonColor: "#ff6a00",
            cancelButtonColor: "#f1f3f5",
            background: "#ffffff",
            width: '450px',
            padding: '2rem',
            borderRadius: '30px',
            reverseButtons: true,
            focusConfirm: false,
            customClass: {
                title: 'premium-swal-title',
                confirmButton: 'premium-swal-confirm-btn',
                cancelButton: 'premium-swal-cancel-btn'
            }
        });

        if (isConfirmed) {
            // Si el usuario por alguna razón no tiene suscripción base (ej: borrada manualmente), permitimos crear una nueva
            // En lugar de bloquear con un error, preparamos la referencia con 'new' o similar, 
            // aunque MercadoPagoService.js espera un ID de suscripción real.
            // Vamos a mejorar esto.

            const subId = currentSub?.id || "nueva";

            setLoading(true);
            try {
                // Invocación Real a Pasarela via Supabase Function
                const response = await MercadoPagoService.generarPreferencia(
                    plan,
                    profile?.id_empresa || currentSub?.id_empresa,
                    user?.email,
                    subId,
                    recargo)
                    ;

                toast.success("Redirigiendo a Mercado Pago...");

                // Redirección real al checkout de Mercado Pago
                if (response.init_point) {
                    window.location.href = response.init_point;
                } else {
                    throw new Error("No se recibió el enlace de pago");
                }

            } catch (error) {
                console.error("Error al procesar el pago:", error);
                toast.error(error.message || "Error al conectar con Mercado Pago");
                setLoading(false);
            }
        }
    };

    if (loading) return <Loading>Preparando ofertas premium...</Loading>;

    return (
        <Container>
            <header className="animate-fade">
                <h1>Planes de Suscripción</h1>
                <p>Elige el motor que impulsará tu crecimiento</p>

                <ToggleContainer>
                    <span className={billingCycle === "mensual" ? "active" : ""}>Mensual</span>
                    <Switch onClick={() => setBillingCycle(billingCycle === "mensual" ? "anual" : "mensual")}>
                        <Slider $active={billingCycle === "anual"} />
                    </Switch>
                    <span className={billingCycle === "anual" ? "active" : ""}>Anual <AhorroBadge>20% Ahorro</AhorroBadge></span>
                </ToggleContainer>
            </header>

            <PlanesGrid>
                {planes
                    .filter(p => p.frecuencia === billingCycle)
                    .map((plan, idx) => (
                        <PlanCard
                            key={plan.id}
                            className={currentSub?.id_plan === plan.id ? "active glass animate-scale" : "glass animate-scale"}
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            {currentSub?.id_plan === plan.id && <Badge>Plan Actual</Badge>}
                            <h3>{plan.nombre}</h3>
                            <Price>
                                <span className="currency">$</span>
                                <span className="amount">
                                    {billingCycle === "anual" ? (plan.monto).toLocaleString() : plan.monto}
                                </span>
                                <span className="period">/{billingCycle === "anual" ? "año" : "mes"}</span>
                            </Price>
                            {billingCycle === "anual" && (
                                <Savings>¡Ahorras un 20%! 💸</Savings>
                            )}
                            <Features>
                                <li>✅ Ventas Ilimitadas</li>
                                <li>✅ Soporte 24/7</li>
                                <li>✅ Almacenamiento Seguro</li>
                                {plan.nombre.toLowerCase().includes("premium") && <li>🌟 Reportería Avanzada</li>}
                                {plan.nombre.toLowerCase().includes("premium") ? <li>🏢 Hasta 3 Sucursales</li> : <li>🏢 1 Sucursal</li>}
                                <li>👥 3 Empleados por sucursal</li>
                            </Features>
                            <SelectBtn
                                onClick={() => isAdmin ? handleSelectPlan(plan) : toast.error("Solo el administrador puede gestionar los planes")}
                                $active={currentSub?.id_plan === plan.id}
                                style={{ opacity: isAdmin ? 1 : 0.6, cursor: isAdmin ? 'pointer' : 'not-allowed' }}
                            >
                                {isAdmin
                                    ? (currentSub?.id_plan === plan.id ? "Gestionar" : "Seleccionar")
                                    : "Solo Administradores"
                                }
                            </SelectBtn>
                        </PlanCard>
                    ))}
            </PlanesGrid>
        </Container>
    );
};

const Container = styled.div` padding: 40px 5%; max-width: 1200px; margin: 0 auto; header { text-align: center; margin-bottom: 60px; h1 { font-size: 42px; font-weight: 900; } p { color: ${({ theme }) => theme.text}88; margin-top: 10px; } } `;
const Loading = styled.div` height: 100vh; display: flex; justify-content: center; align-items: center; font-weight: 800; color: ${({ theme }) => theme.primary}; `;
const PlanesGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; `;
const PlanCard = styled.div` background: ${({ theme }) => theme.cardBg}; border: 1px solid ${({ theme }) => theme.borderColor}; padding: 40px; border-radius: 32px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); &.active { border-color: ${({ theme }) => theme.primary}; transform: scale(1.05); box-shadow: 0 30px 60px -12px rgba(255,106,0,0.2); } &:hover:not(.active) { transform: translateY(-10px); } h3 { font-size: 24px; margin-bottom: 20px; } `;
const Price = styled.div` margin-bottom: 30px; .currency { font-size: 24px; vertical-align: top; color: ${({ theme }) => theme.primary}; font-weight: 700; } .amount { font-size: 64px; font-weight: 900; letter-spacing: -2px; } .period { font-size: 16px; color: ${({ theme }) => theme.text}66; } `;
const Features = styled.ul` margin-bottom: 40px; text-align: left; width: 100%; display: flex; flex-direction: column; gap: 15px; li { font-size: 15px; color: ${({ theme }) => theme.text}aa; } `;
const SelectBtn = styled.button` width: 100%; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 16px; background: ${({ $active, theme }) => $active ? theme.softBg : theme.primary}; color: ${({ $active, theme }) => $active ? theme.text : "white"}; box-shadow: ${({ $active, theme }) => $active ? "none" : `0 10px 20px ${theme.primary}44`}; `;
const Badge = styled.div` position: absolute; top: -15px; background: ${({ theme }) => theme.primary}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; `;
const ToggleContainer = styled.div` display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 30px; span { font-weight: 700; color: ${({ theme }) => theme.text}66; transition: color 0.3s; &.active { color: ${({ theme }) => theme.text}; } } `;
const Switch = styled.div` width: 60px; height: 32px; background: ${({ theme }) => theme.softBg}; border-radius: 30px; padding: 4px; cursor: pointer; border: 1px solid ${({ theme }) => theme.borderColor}; `;
const Slider = styled.div` width: 22px; height: 22px; background: ${({ theme }) => theme.primary}; border-radius: 50%; transition: transform 0.3s; transform: ${({ $active }) => $active ? "translateX(28px)" : "translateX(0)"}; `;
const AhorroBadge = styled.span` background: #4caf5022; color: #4caf50 !important; padding: 4px 8px; border-radius: 8px; font-size: 11px; margin-left: 5px; `;
const Savings = styled.div` background: #4caf5022; color: #4caf50; padding: 8px 16px; border-radius: 12px; font-weight: 700; font-size: 13px; margin-bottom: 25px; `;
