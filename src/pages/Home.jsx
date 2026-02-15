import styled from "styled-components";
import { useAuthStore } from "../store/AuthStore";
import { useThemeStore } from "../store/ThemeStore";
import { useEffect, useState } from "react";
import { UsuarioService } from "../services/UsuarioService";
import { EmpresaService } from "../services/EmpresaService";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const Home = () => {
  const { user, signOut } = useAuthStore();
  const { toggleTheme, theme } = useThemeStore();
  const [profile, setProfile] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uData, eData] = await Promise.all([
        UsuarioService.getCurrentUser(user.id),
        EmpresaService.getEmpresaByUserId(user.id),
      ]);
      setProfile(uData);
      setEmpresa(eData);
    } catch (error) {
      toast.error("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading>Cargando cimientos...</Loading>;

  return (
    <Container>
      <Header>
        <Logo>
          <span>Trees</span> PosVenta
        </Logo>
        <NavActions>
          <Link to="/mi-perfil" style={{ fontSize: "20px" }}>👤</Link>
          <ThemeToggle onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </ThemeToggle>
          <LogoutBtn onClick={signOut}>Cerrar Sesión</LogoutBtn>
        </NavActions>
      </Header>

      <Main>
        <WelcomeSection className="animate-up">
          <h1>¡Hola, {profile?.nombres || "Usuario"}! 👋</h1>
          <p>Bienvenido al futuro de tu gestión comercial.</p>
        </WelcomeSection>

        <Grid>
          <Card className="glass animate-scale" style={{ animationDelay: "0.1s" }}>
            <h3>🏢 Tu Empresa</h3>
            {empresa ? (
              <InfoList>
                <li><strong>Nombre:</strong> {empresa.nombre}</li>
                <li><strong>Moneda:</strong> {empresa.moneda}</li>
                <li><strong>Plan:</strong> {empresa.id_plan || "Básico"}</li>
              </InfoList>
            ) : (
              <p>No tienes una empresa registrada.</p>
            )}
          </Card>

          <Card className="glass animate-scale" style={{ animationDelay: "0.2s" }}>
            <h3>👤 Tu Perfil</h3>
            <InfoList>
              <li><strong>Email:</strong> {user?.email}</li>
              <li><strong>Rol:</strong> {profile?.roles?.nombre || "Sin rol"}</li>
              <li><strong>Estado:</strong> {profile?.estado || "Activo"}</li>
            </InfoList>
          </Card>
        </Grid>

        <NextSteps className="animate-up" style={{ animationDelay: "0.3s" }}>
          <h2>Análisis y Operaciones</h2>
          <StepList>
            <Link to="/dashboard">
              <StepItem className="premium">
                <div className="icon">📊</div>
                <div>
                  <h4>Dashboard</h4>
                  <p>Métricas de ventas y rendimiento.</p>
                </div>
              </StepItem>
            </Link>
            <Link to="/pos">
              <StepItem>
                <div className="icon">🛒</div>
                <div>
                  <h4>Vender (POS)</h4>
                  <p>Abre tu caja y comienza a facturar.</p>
                </div>
              </StepItem>
            </Link>
            <Link to="/inventario/productos">
              <StepItem>
                <div className="icon">📦</div>
                <div>
                  <h4>Inventario</h4>
                  <p>Gestione sus productos y stock.</p>
                </div>
              </StepItem>
            </Link>
          </StepList>
        </NextSteps>
      </Main>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.bg};
`;

const Loading = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 5%;
  background: ${({ theme }) => theme.bgAlpha};
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const NavActions = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const ThemeToggle = styled.button`
  background: ${({ theme }) => theme.softBg};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LogoutBtn = styled.button`
  background: ${({ theme }) => theme.danger};
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const WelcomeSection = styled.section`
  margin-bottom: 40px;
  h1 {
    font-size: 36px;
    margin-bottom: 8px;
  }
  p {
    color: ${({ theme }) => theme.text}aa;
    font-size: 18px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  padding: 25px;
  border-radius: 20px;
  h3 {
    margin-bottom: 20px;
    font-size: 20px;
    color: ${({ theme }) => theme.primary};
  }
`;

const InfoList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  li {
    font-size: 15px;
    strong {
      color: ${({ theme }) => theme.text};
    }
  }
`;

const NextSteps = styled.section`
  h2 {
    margin-bottom: 25px;
  }
`;

const StepList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const StepItem = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  background: ${({ theme }) => theme.softBg};
  border-radius: 15px;
  align-items: center;
  .icon {
    font-size: 32px;
  }
  h4 {
    margin-bottom: 4px;
    color: ${({ theme }) => theme.text};
  }
  p {
    font-size: 14px;
    color: ${({ theme }) => theme.text}88;
  }
`;
