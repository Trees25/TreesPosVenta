import styled from "styled-components";
import { useState, useEffect } from "react";
import { SuscripcionService } from "../services/SuscripcionService";
import { useAuthStore } from "../store/AuthStore";
import { supabase } from "../supabase";
import { toast } from "sonner";
import Swal from "sweetalert2";

export const Planes = () => {
    const { user } = useAuthStore();
    const [planes, setPlanes] = useState([]);
    const [currentSub, setCurrentSub] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: usuario } = await supabase.from("usuarios").select("id_empresa").eq("id_auth", user.id).single();

            const [pList, sub] = await Promise.all([
                SuscripcionService.obtenerPlanes(),
                SuscripcionService.obtenerSuscripcionActiva(usuario.id_empresa)
            ]);

            setPlanes(pList);
            setCurrentSub(sub);
        } catch (error) {
            toast.error("Error al cargar planes");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (plan) => {
        if (currentSub?.id_plan === plan.id) return toast.info("Ya tienes este plan activo");

        const { isConfirmed } = await Swal.fire({
            title: `¿Cambiar al plan ${plan.nombre}?`,
            text: "Se actualizarán tus beneficios inmediatamente.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#ff6a00"
        });

        if (isConfirmed) {
            toast.success("¡Suscripción actualizada con éxito!");
            fetchData();
        }
    };

    if (loading) return <Loading>Preparando ofertas premium...</Loading>;

    return (
        <Container>
            <header className="animate-fade">
                <h1>Planes de Suscripción</h1>
                <p>Elige el motor que impulsará tu crecimiento</p>
            </header>

            <PlanesGrid>
                {planes.map((plan, idx) => (
                    <PlanCard
                        key={plan.id}
                        className={currentSub?.id_plan === plan.id ? "active glass animate-scale" : "glass animate-scale"}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        {currentSub?.id_plan === plan.id && <Badge>Plan Actual</Badge>}
                        <h3>{plan.nombre}</h3>
                        <Price>
                            <span className="currency">$</span>
                            <span className="amount">{plan.precio}</span>
                            <span className="period">/mes</span>
                        </Price>
                        <Features>
                            <li>✅ Ventas Ilimitadas</li>
                            <li>✅ Soporte 24/7</li>
                            <li>✅ Almacenamiento Seguro</li>
                            {plan.nombre.toLowerCase().includes("premium") && <li>🌟 Reportería Avanzada</li>}
                        </Features>
                        <SelectBtn
                            onClick={() => handleSelectPlan(plan)}
                            $active={currentSub?.id_plan === plan.id}
                        >
                            {currentSub?.id_plan === plan.id ? "Gestionar" : "Seleccionar"}
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
