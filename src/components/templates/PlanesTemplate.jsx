import styled from "styled-components";
import { useState, useEffect } from "react";
import { Btn1 } from "../moleculas/Btn1";
import { Device } from "../../styles/breakpoints";
import { v } from "../../styles/variables";
import { useNavigate } from "react-router-dom";
import { VolverBtn } from "../moleculas/VolverBtn";
import { planes } from "../../data/planes";
import { useEmpresaStore } from "../../store/EmpresaStore";
import { UserAuth } from "../../context/AuthContent";
import { useSuscripcionesStore } from "../../store/SuscripcionStore";
import { toast } from "sonner";
import { useSucursalesStore } from "../../store/SucursalesStore";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/AuthStore";

import { AsignarPermisosDefault } from "../../supabase/crudPermisos";

export function PlanesTemplate() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isAnnual, setIsAnnual] = useState(false);
    const { user } = UserAuth();
    const { dataempresa } = useEmpresaStore();
    const { activarPruebaGratuita, cambiarPlan } = useSuscripcionesStore();
    const { dataSucursales, mostrarSucursales } = useSucursalesStore();
    const { cerrarSesion } = useAuthStore();

    useEffect(() => {
        if (dataempresa?.id) {
            mostrarSucursales({ id_empresa: dataempresa.id });
        }
    }, [dataempresa?.id]);

    const handleSelectPlan = async (plan) => {
        // VALIDACIÓN DE DOWNGRADE DE SUCURSALES
        const currentBranches = dataSucursales?.length || 0;
        const targetLimit = plan.limite_sucursales;

        if (currentBranches > targetLimit) {
            toast.warning(`No puedes cambiar al ${plan.nombre}. Tienes ${currentBranches} sucursales activas y este plan solo permite ${targetLimit}. Debes eliminar sucursales primero.`);
            return;
        }

        // LÓGICA NUEVA: Si el usuario ya está logueado y tiene empresa, activamos directo
        if (user && dataempresa?.id) {
            try {
                // Usamos el ID interno (1, 2) para la consistencia de la BD y la visualización
                // Los IDs de MercadoPago (id_plan_a/m) se usarían solo al generar el link de pago real
                const planId = plan.id;

                // Si ya tiene un plan asignado (es un cambio de plan)
                if (dataempresa.id_plan) {
                    await cambiarPlan(dataempresa.id, planId);
                    toast.success(`¡Plan cambiado a ${plan.nombre} con éxito!`);
                    // Invalidate query to refresh company data and UI immediately
                    await queryClient.invalidateQueries(["mostrar empresa"]);
                    navigate("/");
                } else {
                    // Si no tiene plan (primera vez)
                    await activarPruebaGratuita(dataempresa.id, planId, user.id);

                    await AsignarPermisosDefault({ id_usuario: user.id });

                    toast.success(`¡Plan ${plan.nombre} activado con éxito! Comienza tu prueba gratuita.`);

                    await queryClient.invalidateQueries(["mostrar empresa"]);

                    navigate("/");
                }
            } catch (error) {
                console.error("Error CRITICO en handleSelectPlan:", error);
                toast.error("Error al procesar: " + error.message);
            }
            return;
        }

        // Si no está logueado, flujo normal (guardar y login)
        // Guardar el plan seleccionado en localStorage
        localStorage.setItem("pending_plan", JSON.stringify({
            ...plan,
            isAnnual // Guardamos si eligió anual o mensual
        }));

        // Redirigir al login con un parámetro para indicar que viene de elegir plan
        navigate("/login?from_plan=true");
    };

    const handleVolver = async () => {
        if (user) {
            await cerrarSesion();
            queryClient.clear();
            navigate("/login", { replace: true });
        } else {
            navigate("/login");
        }
    };

    return (
        <Container>
            <div className="volver-content">
                <VolverBtn funcion={handleVolver} />
            </div>
            <Header>
                <h1>Elige el plan perfecto para tu negocio</h1>
                <p>Comienza hoy mismo con <span>1 mes totalmente gratis</span></p>

                <ToggleContainer>
                    <span className={!isAnnual ? "active" : ""}>Mensual</span>
                    <Switch onClick={() => setIsAnnual(!isAnnual)}>
                        <Slider $active={isAnnual} />
                    </Switch>
                    <span className={isAnnual ? "active" : ""}>
                        Anual <SaveTag>Ahorra 20%</SaveTag>
                    </span>
                </ToggleContainer>
            </Header>

            <GridPlanes>
                {planes.map((plan) => (
                    <Card key={plan.id} $popular={plan.popular}>
                        {plan.popular && <PopularBadge>Más Popular</PopularBadge>}
                        <PlanName>{plan.nombre}</PlanName>
                        <Price>
                            <span className="currency">$</span>
                            <span className="amount">
                                {isAnnual ? (plan.precioAnual / 12).toLocaleString() : plan.precioMensual.toLocaleString()}
                            </span>
                            <span className="period">/mes</span>
                        </Price>
                        {isAnnual && <YearlyTotal>Facturado anualmente (${plan.precioAnual.toLocaleString()})</YearlyTotal>}

                        <Description>{plan.descripcion}</Description>

                        <Divider />

                        <Features>
                            <li><strong>{plan.sucursales}</strong></li>
                            {plan.beneficios.map((b, i) => (
                                <li key={i}>{b}</li>
                            ))}
                        </Features>

                        <Btn1
                            titulo="Comenzar Prueba Gratis"
                            bgcolor={plan.popular ? v.colorPrincipal : ({ theme }) => theme.bg4}
                            color={plan.popular ? "#fff" : ({ theme }) => theme.text}
                            width="100%"
                            funcion={() => handleSelectPlan(plan)}
                            className="bypass-penalty"
                        />
                    </Card>
                ))}
            </GridPlanes>

            <FooterNote>
                * Al finalizar el mes de prueba, podrás elegir continuar con el plan seleccionado o cambiarlo.
            </FooterNote>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 20px;
    background-color: ${({ theme }) => theme.bgtotal};
    min-height: 100vh;
    color: ${({ theme }) => theme.text};
    position: relative;
    .volver-content {
        position: absolute;
        top: 20px;
        left: 20px;
    }
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 50px;
    max-width: 800px;
    h1 {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 15px;
        background: linear-gradient(90deg, #1cb0f6, #009ee3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        @media (max-width: 768px) {
            font-size: 1.8rem;
        }
    }
    p {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.colorSubtitle};
        span {
            font-weight: bold;
            color: #00ca91;
        }

        @media (max-width: 768px) {
            font-size: 1rem;
        }
    }
`;

const ToggleContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
    font-weight: 600;
    .active {
        color: #1cb0f6;
    }
`;

const Switch = styled.div`
    width: 60px;
    height: 30px;
    background-color: ${({ theme }) => theme.bg4};
    border-radius: 20px;
    padding: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
`;

const Slider = styled.div`
    width: 24px;
    height: 24px;
    background-color: #fff;
    border-radius: 50%;
    transition: transform 0.3s ease;
    transform: ${({ $active }) => ($active ? "translateX(30px)" : "translateX(0)")};
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const SaveTag = styled.span`
    background: #e6f7ff;
    color: #1890ff;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    margin-left: 8px;
    border: 1px solid #91d5ff;
`;

const GridPlanes = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
    width: 100%;
    max-width: 800px;

    @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const Card = styled.div`
    background-color: ${({ theme }) => theme.bgcards};
    padding: 40px 30px;
    border-radius: 20px;
    box-shadow: ${({ theme }) => theme.boxshadow};
    display: flex;
    flex-direction: column;
    position: relative;
    border: 2px solid ${({ $popular }) => ($popular ? "#1cb0f6" : "transparent")};
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    @media (max-width: 768px) {
        padding: 30px 20px;
    }

    &:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
`;

const PopularBadge = styled.div`
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background: #1cb0f6;
    color: #fff;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
`;

const PlanName = styled.h2`
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 20px;
`;

const Price = styled.div`
    text-align: center;
    margin-bottom: 10px;
    .currency { font-size: 1.5rem; vertical-align: top; margin-right: 5px; }
    .amount { font-size: 3rem; font-weight: 800; }
    .period { color: ${({ theme }) => theme.colorSubtitle}; margin-left: 5px; }

    @media (max-width: 768px) {
        .amount { font-size: 2.2rem; }
    }
`;

const YearlyTotal = styled.p`
    text-align: center;
    font-size: 0.85rem;
    color: #00ca91;
    margin-bottom: 15px;
    font-weight: 600;
`;

const Description = styled.p`
    text-align: center;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colorSubtitle};
    margin-bottom: 25px;
    min-height: 50px;
`;

const Divider = styled.div`
    height: 1px;
    background: ${({ theme }) => theme.bg4};
    width: 100%;
    margin-bottom: 25px;
`;

const Features = styled.ul`
    list-style: none;
    padding: 0;
    margin-bottom: 30px;
    flex-grow: 1;
    li {
        margin-bottom: 12px;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 10px;
        &::before {
            content: "✓";
            color: #1cb0f6;
            font-weight: bold;
        }
    }
`;

const FooterNote = styled.p`
    margin-top: 40px;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colorSubtitle};
    text-align: center;
    max-width: 600px;
`;
