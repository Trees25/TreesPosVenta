import styled from "styled-components";
import { useAuthStore } from "../store/AuthStore";
import { useState, useEffect } from "react";
import { UsuarioService } from "../services/UsuarioService";
import { MetodoPagoService } from "../services/MetodoPagoService";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

export const MiPerfil = () => {
    const { user, profile: authProfile } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [metodosActivos, setMetodosActivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    const idEmpresa = authProfile?.id_empresa || authProfile?.empresa?.id;

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, idEmpresa]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileData, metodosData] = await Promise.all([
                UsuarioService.getCurrentUser(user.id),
                idEmpresa ? MetodoPagoService.listarMetodosPorEmpresa(idEmpresa) : []
            ]);
            setProfile(profileData);
            setMetodosActivos(metodosData || []);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMetodo = async (metodoEstandar) => {
        if (!idEmpresa) return;

        const activo = metodosActivos.find(m => m.nombre === metodoEstandar.nombre);

        try {
            setUpdating(metodoEstandar.nombre);
            if (activo) {
                await MetodoPagoService.desactivarMetodo(activo.id);
                setMetodosActivos(prev => prev.filter(m => m.id !== activo.id));
                toast.success(`${metodoEstandar.nombre} desactivado`);
            } else {
                const nuevoMetodo = await MetodoPagoService.activarMetodo(idEmpresa, metodoEstandar);
                setMetodosActivos(prev => [...prev, nuevoMetodo]);
                toast.success(`${metodoEstandar.nombre} activado`);
            }
        } catch (error) {
            toast.error("Error al actualizar método");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <Loading>Cargando perfil...</Loading>;

    return (
        <Container>
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <h1>Mi Perfil</h1>
                </div>
            </header>

            <MainGrid>
                <section>
                    <SectionTitle>Datos de Usuario</SectionTitle>
                    <Card className="glass">
                        <InfoGroup>
                            <label>Nombres</label>
                            <p>{profile?.nombres || "No especificado"}</p>
                        </InfoGroup>
                        <InfoGroup>
                            <label>Email</label>
                            <p>{user?.email}</p>
                        </InfoGroup>
                        <InfoGroup>
                            <label>Rol</label>
                            <p>{profile?.roles?.nombre || "Sin rol"}</p>
                        </InfoGroup>
                    </Card>
                </section>

                {profile?.id_rol === 1 && (
                    <section>
                        <SectionTitle>Métodos de Pago Aceptados</SectionTitle>
                        <Card className="glass">
                            <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px' }}>
                                Activa los métodos de pago que deseas que aparezcan en el módulo POS al realizar una venta.
                            </p>
                            <MetodosList>
                                {MetodoPagoService.METODOS_ESTANDAR.map((m) => {
                                    const isActivo = metodosActivos.some(ma => ma.nombre === m.nombre);
                                    return (
                                        <MetodoItem key={m.nombre} $activo={isActivo}>
                                            <div className="info">
                                                <Icon icon={m.icono} width="24" />
                                                <span>{m.nombre}</span>
                                            </div>
                                            <Toggle
                                                $active={isActivo}
                                                onClick={() => !updating && handleToggleMetodo(m)}
                                                style={{ opacity: updating === m.nombre ? 0.5 : 1 }}
                                            >
                                                <div className="dot" />
                                            </Toggle>
                                        </MetodoItem>
                                    );
                                })}
                            </MetodosList>
                        </Card>
                    </section>
                )}
            </MainGrid>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 5%;
    max-width: 1000px;
    margin: 0 auto;
    header {
        margin-bottom: 30px;
    }
`;

const MainGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const SectionTitle = styled.h2`
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${({ theme }) => theme.text}88;
    margin-bottom: 15px;
    font-weight: 800;
`;

const HomeBtn = styled(Link)`
    background: ${({ theme }) => theme.softBg};
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.borderColor}44;
    text-decoration: none;
    font-size: 20px;
    transition: all 0.2s;
    &:hover {
        background: ${({ theme }) => theme.primary}22;
        border-color: ${({ theme }) => theme.primary};
        transform: scale(1.05);
    }
`;

const Card = styled.div` 
    background: ${({ theme }) => theme.cardBg}; 
    border: 1px solid ${({ theme }) => theme.borderColor}; 
    padding: 30px; 
    border-radius: 24px; 
    height: fit-content;
`;

const InfoGroup = styled.div` 
    margin-bottom: 20px; 
    label { font-size: 11px; font-weight: 800; color: ${({ theme }) => theme.primary}; text-transform: uppercase; } 
    p { font-size: 16px; margin-top: 5px; font-weight: 600; } 
`;

const MetodosList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const MetodoItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: ${({ theme }) => theme.softBg};
    border-radius: 12px;
    border: 1px solid ${({ $activo, theme }) => $activo ? theme.primary + '44' : theme.borderColor + '22'};
    transition: all 0.2s;

    .info {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
        font-size: 14px;
        color: ${({ $activo, theme }) => $activo ? theme.text : theme.text + '88'};
    }
`;

const Toggle = styled.div`
    width: 44px;
    height: 24px;
    background: ${({ $active, theme }) => $active ? theme.primary : theme.borderColor + '44'};
    border-radius: 20px;
    padding: 3px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;

    .dot {
        width: 18px;
        height: 18px;
        background: white;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(${({ $active }) => $active ? '20px' : '0'});
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
`;

const Loading = styled.div` display: flex; justify-content: center; align-items: center; height: 100vh; font-weight: 700; `;
