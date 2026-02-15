import styled from "styled-components";
import { useAuthStore } from "../store/AuthStore";
import { useState, useEffect } from "react";
import { UsuarioService } from "../services/UsuarioService";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const MiPerfil = () => {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await UsuarioService.getCurrentUser(user.id);
            setProfile(data);
        } catch (error) {
            toast.error("Error al cargar perfil");
        } finally {
            setLoading(false);
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
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 5%;
    max-width: 800px;
    margin: 0 auto;
    header {
        margin-bottom: 30px;
    }
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

const Card = styled.div` background: ${({ theme }) => theme.cardBg}; border: 1px solid ${({ theme }) => theme.borderColor}; padding: 40px; border-radius: 24px; `;
const InfoGroup = styled.div` margin-bottom: 20px; label { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.primary}; text-transform: uppercase; } p { font-size: 18px; margin-top: 5px; } `;
const Loading = styled.div` display: flex; justify-content: center; align-items: center; height: 100vh; font-weight: 700; `;
