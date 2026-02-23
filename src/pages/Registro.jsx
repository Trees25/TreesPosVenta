import styled from "styled-components";
import { useForm } from "react-hook-form";
import { supabase } from "../supabase";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EmpresaService } from "../services/EmpresaService";

export const Registro = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const password = watch("password");

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // 1. Registro en Supabase Auth con Metadata para el Trigger
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        nombre_empresa: data.nombreNegocio,
                        nombres: data.nombreNegocio // Usamos el nombre del negocio como nombre del admin por defecto
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                toast.success("¡Cuenta creada con éxito! Bienvenida " + data.nombreNegocio);
                navigate("/");
            }

        } catch (error) {
            console.error("Error en registro:", error);
            toast.error("Error al registrarse: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <GlassCard className="glass animate-up">
                <Header>
                    <h1>Crea tu Negocio 🚀</h1>
                    <p>Comienza hoy mismo con Trees PosVenta</p>
                </Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <InputGroup>
                        <label>Nombre de tu Negocio</label>
                        <input
                            type="text"
                            placeholder="Ej: Minimarket Oasis"
                            {...register("nombreNegocio", { required: "El nombre del negocio es obligatorio" })}
                        />
                        {errors.nombreNegocio && <ErrorMessage>{errors.nombreNegocio.message}</ErrorMessage>}
                    </InputGroup>

                    <InputGroup>
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            placeholder="admin@tuempresa.com"
                            {...register("email", { required: "El correo es obligatorio" })}
                        />
                        {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                    </InputGroup>

                    <FormRow>
                        <InputGroup>
                            <label>Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...register("password", {
                                    required: "La contraseña es obligatoria",
                                    minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                })}
                            />
                            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                        </InputGroup>
                        <InputGroup>
                            <label>Repetir Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...register("confirmPassword", {
                                    required: "Confirme su contraseña",
                                    validate: value => value === password || "Las contraseñas no coinciden"
                                })}
                            />
                            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
                        </InputGroup>
                    </FormRow>

                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Registrar mi Negocio"}
                    </SubmitButton>
                </Form>
                <Footer>
                    <span>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></span>
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
    max-width: 550px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.8s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 30px;
    h1 {
        color: #ff6a00;
        font-size: 28px;
        font-weight: 800;
        margin-bottom: 8px;
        letter-spacing: -1px;
    }
    p {
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    label {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
        margin-left: 4px;
    }
    input {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 14px 16px;
        color: white;
        font-size: 15px;
        transition: all 0.3s ease;
        width: 100%;
        &::placeholder {
            color: rgba(255, 255, 255, 0.2);
        }
        &:focus {
            border-color: #ff6a00;
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 0 4px rgba(255, 106, 0, 0.1);
        }
    }
`;

const ErrorMessage = styled.span`
    color: #ff5e57;
    font-size: 12px;
    margin-left: 4px;
`;

const SubmitButton = styled.button`
    background: #ff6a00;
    color: white;
    padding: 16px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    margin-top: 10px;
    box-shadow: 0 10px 15px -3px rgba(255, 106, 0, 0.3);
    &:hover {
        background: #ff7b1a;
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(255, 106, 0, 0.4);
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const Footer = styled.div`
    margin-top: 25px;
    text-align: center;
    span {
        color: rgba(255, 255, 255, 0.4);
        font-size: 13px;
        a {
            color: #ff6a00;
            font-weight: 600;
            margin-left: 4px;
            text-decoration: none;
            &:hover {
                text-decoration: underline;
            }
        }
    }
`;
