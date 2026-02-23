import styled from "styled-components";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/AuthStore";
import { useThemeStore } from "../store/ThemeStore";
import { EmpresaService } from "../services/EmpresaService";
import { SubscriptionStatus } from "../components/SubscriptionStatus";
import { usePenalty } from "../hooks/usePenalty";

export const Home = () => {
  const { user, profile, signOut, profileError } = useAuthStore();
  const { toggleTheme, theme } = useThemeStore();
  const { triggerPenalty } = usePenalty();
  const navigate = useNavigate();
  const empresa = profile?.empresa;
  const loading = !profile && !profileError;

  useEffect(() => {
    if (user) {
      // Verificar si venimos de un pago exitoso
      const params = new URLSearchParams(window.location.search);
      if (params.get("status") === "success") {
        Swal.fire({
          title: "¡Pago Exitoso! 🎉",
          text: "Tu plan se ha actualizado correctamente. ¡Disfruta de tus nuevos beneficios!",
          icon: "success",
          confirmButtonText: "¡Excelente!",
          timer: 5000
        });
        // Limpiar parámetros de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user]);

  const hasPermission = (moduleName) => {
    if (profile?.id_rol === 1) return true; // El admin principal siempre tiene acceso
    return profile?.permisos?.some(p => p.modulos?.nombre === moduleName);
  };

  const handleNavigation = (path) => {
    if (profile?.estado !== 'activo') {
      Swal.fire({
        title: "Cuenta Inactiva 🚫",
        text: "Tu usuario se encuentra en estado inactivo. Contacta con tu administrador para habilitar el acceso.",
        icon: "error",
        confirmButtonColor: "#ff6a00",
        confirmButtonText: "Entendido"
      });
      return;
    }
    triggerPenalty(() => navigate(path));
  };

  if (profileError) {
    return (
      <Loading style={{ flexDirection: 'column', gap: '20px', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#ff5e57' }}>⚠️ Sesión Desincronizada</h2>
        <p style={{ maxWidth: '400px', fontSize: '16px', lineHeight: '1.5' }}>
          Parece que la base de datos ha sido reiniciada o tu sesión ha expirado.
          Por seguridad, por favor cierra sesión e ingresa de nuevo.
        </p>
        <LogoutBtn onClick={signOut} style={{ padding: '12px 24px', fontSize: '16px' }}>
          Reiniciar Sesión 🚀
        </LogoutBtn>
      </Loading>
    );
  }

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
                <li><strong>Plan:</strong> {empresa.planes?.nombre} ({empresa.planes?.frecuencia})</li>
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
            {profile?.id_rol === 1 && (
              <div onClick={() => handleNavigation("/reporte-ventas")} style={{ cursor: 'pointer' }}>
                <StepItem className="premium">
                  <div className="icon">📈</div>
                  <div>
                    <h4>Reporte de Ventas</h4>
                    <p>Análisis detallado por empleado.</p>
                  </div>
                </StepItem>
              </div>
            )}

            {hasPermission('Dashboard') && (
              <div onClick={() => handleNavigation("/dashboard")} style={{ cursor: 'pointer' }}>
                <StepItem className="premium">
                  <div className="icon">📊</div>
                  <div>
                    <h4>Dashboard</h4>
                    <p>Métricas de ventas y rendimiento.</p>
                  </div>
                </StepItem>
              </div>
            )}

            {hasPermission('Ventas') && (
              <div onClick={() => handleNavigation("/pos")} style={{ cursor: 'pointer' }}>
                <StepItem>
                  <div className="icon">🛒</div>
                  <div>
                    <h4>Vender (POS)</h4>
                    <p>Abre tu caja y comienza a facturar.</p>
                  </div>
                </StepItem>
              </div>
            )}

            {hasPermission('Inventario') && (
              <>
                <div onClick={() => handleNavigation("/inventario/productos")} style={{ cursor: 'pointer' }}>
                  <StepItem>
                    <div className="icon">📦</div>
                    <div>
                      <h4>Productos</h4>
                      <p>Gestione sus productos y stock.</p>
                    </div>
                  </StepItem>
                </div>
                <div onClick={() => handleNavigation("/inventario/ajuste")} style={{ cursor: 'pointer' }}>
                  <StepItem>
                    <div className="icon">🔧</div>
                    <div>
                      <h4>Ajuste de Stock</h4>
                      <p>Registra entradas y salidas manuales.</p>
                    </div>
                  </StepItem>
                </div>
                <div onClick={() => handleNavigation("/inventario/categorias")} style={{ cursor: 'pointer' }}>
                  <StepItem>
                    <div className="icon">📁</div>
                    <div>
                      <h4>Categorías</h4>
                      <p>Organiza tus productos por grupos.</p>
                    </div>
                  </StepItem>
                </div>
              </>
            )}

            {hasPermission('Categorías') && !hasPermission('Inventario') && (
              <div onClick={() => handleNavigation("/inventario/categorias")} style={{ cursor: 'pointer' }}>
                <StepItem>
                  <div className="icon">📁</div>
                  <div>
                    <h4>Categorías</h4>
                    <p>Organiza tus productos por grupos.</p>
                  </div>
                </StepItem>
              </div>
            )}

            {hasPermission('Sucursales') && (
              <div onClick={() => handleNavigation("/sucursales")} style={{ cursor: 'pointer' }}>
                <StepItem>
                  <div className="icon">🏢</div>
                  <div>
                    <h4>Sucursales</h4>
                    <p>Gestiona tus locales y almacenes.</p>
                  </div>
                </StepItem>
              </div>
            )}

            {hasPermission('Clientes') && (
              <div onClick={() => handleNavigation("/clientes")} style={{ cursor: 'pointer' }}>
                <StepItem>
                  <div className="icon">👥</div>
                  <div>
                    <h4>Clientes</h4>
                    <p>Directorio de clientes frecuentes.</p>
                  </div>
                </StepItem>
              </div>
            )}

            {hasPermission('Proveedores') && (
              <div onClick={() => handleNavigation("/proveedores")} style={{ cursor: 'pointer' }}>
                <StepItem>
                  <div className="icon">🚚</div>
                  <div>
                    <h4>Proveedores</h4>
                    <p>Gestión de abastecimiento.</p>
                  </div>
                </StepItem>
              </div>
            )}

            {hasPermission('Personal') && (
              <div onClick={() => handleNavigation("/personal")} style={{ cursor: 'pointer' }}>
                <StepItem className="premium">
                  <div className="icon">🎭</div>
                  <div>
                    <h4>Personal y Equipo</h4>
                    <p>Administra empleados y permisos.</p>
                  </div>
                </StepItem>
              </div>
            )}
          </StepList>
        </NextSteps>
      </Main>
      <SubscriptionStatus />
    </Container >
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
