import styled from "styled-components";
import { useForm } from "react-hook-form";
import { supabase } from "../supabase";
import { toast } from "sonner";
import { Device } from "../styles/breakpoints";
import { useState } from "react";
import { useAuthStore } from "../store/AuthStore";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error("Error con Google: " + error.message);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error("Error al iniciar sesión: " + error.message);
    } else {
      toast.success("¡Bienvenido de nuevo!");
    }
    setLoading(false);
  };

  return (
    <Container>
      <GlassCard className="glass animate-up">
        <Header>
          <h1>Trees PosVenta</h1>
          <p>Potenciando tu negocio con elegancia</p>
        </Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="admin@ejemplo.com"
              {...register("email", { required: "El correo es obligatorio" })}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </InputGroup>
          <InputGroup>
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "La contraseña es obligatoria" })}
            />
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </InputGroup>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Iniciando..." : "Entrar al Sistema"}
          </SubmitButton>

          <Divider>
            <span>O entrar con</span>
          </Divider>

          <GoogleButton type="button" onClick={loginWithGoogle}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Continuar con Google
          </GoogleButton>
        </Form>
        <Footer>
          <span>¿No tienes cuenta? <a href="#">Contactar soporte</a></span>
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
  animation: fadeIn 0.8s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  h1 {
    color: #ff6a00;
    font-size: 32px;
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
  gap: 24px;
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
  margin-top: 12px;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 10px 0;
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  span {
    padding: 0 10px;
    color: rgba(255, 255, 255, 0.3);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: white;
  color: #1a1e26;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  img {
    width: 20px;
  }
  &:hover {
    background: #f1f1f1;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const Footer = styled.div`
  margin-top: 32px;
  text-align: center;
  span {
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    a {
      color: #ff6a00;
      font-weight: 600;
      margin-left: 4px;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;
