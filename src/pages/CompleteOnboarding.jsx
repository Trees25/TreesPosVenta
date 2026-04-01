import styled from "styled-components";
import { useForm } from "react-hook-form";
import { supabase } from "../supabase";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { OnboardingService } from "../services/OnboardingService";

export const CompleteOnboarding = () => {
    const [loading, setLoading] = useState(false);
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    useEffect(() => {
        // Recuperar nombre si venía de la página de registro
        const pendingName = localStorage.getItem("pending_business_name");
        if (pendingName) {
            setValue("nombreNegocio", pendingName);
            localStorage.removeItem("pending_business_name");
        }
    }, [setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Llamar a una función RPC que cree la empresa y vincule al usuario
            // Aprovecharemos que el trigger no lo hizo porque faltaba el nombre
            const { error } = await supabase.rpc("crear_empresa_onboarding", {
                p_nombre_empresa: data.nombreNegocio,
                p_auth_id: user.id
            });

            if (error) throw error;

            toast.info("Configurando tu infraestructura base...");
            
            // Inicializar Sucursal, Almacen, Caja, etc.
            await OnboardingService.initializeInfrastructure(user.id, data.nombreNegocio);

            toast.success("¡Todo listo! Bienvenido a tu nuevo sistema.");

            // Recargar la página para que el App.jsx detecte el nuevo perfil completo
            window.location.href = "/";
        } catch (error) {
            console.error("Error en onboarding:", error);
            toast.error("Error al crear empresa: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <GlassCard className="glass animate-up">
                <Header>
                    <h1>Casi listo, {user?.user_metadata?.full_name || 'hola'} 👋</h1>
                    <p>Necesitamos el nombre de tu negocio para comenzar</p>
                </Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <InputGroup>
                        <label>Nombre de tu Negocio</label>
                        <input
                            type="text"
                            placeholder="Ej: Mi Tienda Inteligente"
                            autoFocus
                            {...register("nombreNegocio", { required: "El nombre es obligatorio" })}
                        />
                        {errors.nombreNegocio && <ErrorMessage>{errors.nombreNegocio.message}</ErrorMessage>}
                    </InputGroup>

                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? "Configurando..." : "COMENZAR AHORA 🚀"}
                    </SubmitButton>
                </Form>
                <Footer>
                    <button onClick={() => signOut()}>Cerrar Sesión</button>
                </Footer>
            </GlassCard>
        </Container>
    );
};

const Container = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #0b0e14 0%, #1a1e26 100%);
    padding: 20px;
`;

const GlassCard = styled.div`
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 40px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 30px;
    h1 { color: #ff6a00; font-size: 24px; font-weight: 800; margin-bottom: 8px; }
    p { color: rgba(255, 255, 255, 0.5); font-size: 14px; }
`;

const Form = styled.form` display: flex; flex-direction: column; gap: 20px; `;

const InputGroup = styled.div`
    display: flex; gap: 8px; flex-direction: column;
    label { font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.8); }
    input {
        background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px; padding: 14px 16px; color: white; width: 100%;
        &:focus { border-color: #ff6a00; outline: none; box-shadow: 0 0 0 4px rgba(255, 106, 0, 0.1); }
    }
`;

const ErrorMessage = styled.span` color: #ff5e57; font-size: 12px; `;

const SubmitButton = styled.button`
    background: #ff6a00; color: white; padding: 16px; border-radius: 12px;
    font-size: 16px; font-weight: 700; cursor: pointer;
    &:disabled { opacity: 0.5; }
`;

const Footer = styled.div`
    margin-top: 20px; text-align: center;
    button { 
        background: none; border: none; color: rgba(255, 255, 255, 0.3); 
        font-size: 12px; cursor: pointer; text-decoration: underline;
    }
`;
