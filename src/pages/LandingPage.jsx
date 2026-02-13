import styled from "styled-components";
import { v } from "../styles/variables";
import { Device } from "../styles/breakpoints";
import { Btn1 } from "../components/moleculas/Btn1";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import { planes } from "../data/planes";
import {
    FaRocket,
    FaChartBar,
    FaStore,
    FaUsers,
    FaLock,
    FaCheckCircle
} from "react-icons/fa";
import { useEffect } from "react";
import ScrollReveal from "scrollreveal";

export function LandingPage() {
    const { loginGoogle } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '60px',
            duration: 1000,
            delay: 200,
            reset: false
        });

        sr.reveal('.reveal');
        sr.reveal('.reveal-delay', { delay: 400 });
    }, []);

    return (
        <Container>
            {/* Header */}
            <Header>
                <div className="logo">
                    <img src={v.logo} alt="Logo" />
                    <span>POS VENTAS</span>
                </div>
                <div className="nav-btns">
                    <button className="btn-login" onClick={() => navigate("/login")}>Ingresar</button>
                    <Btn1
                        titulo="Registrarse"
                        bgcolor={v.colorPrincipal}
                        color="#fff"
                        funcion={loginGoogle}
                    />
                </div>
            </Header>

            {/* Hero Section */}
            <Hero>
                <div className="hero-content reveal">
                    <h1>Lleva tu negocio al <span>siguiente nivel</span></h1>
                    <p>
                        El sistema de punto de venta más intuitivo, potente y escalable del mercado.
                        Gestiona tu inventario, ventas y reportes desde cualquier lugar.
                    </p>
                    <div className="hero-btns">
                        <Btn1
                            titulo="Empezar Gratis Ahora"
                            bgcolor={v.colorPrincipal}
                            color="#fff"
                            padding="15px 30px"
                            fontSize="1.2rem"
                            funcion={loginGoogle}
                            icono={<v.iconogoogle />}
                        />
                    </div>
                </div>
                <div className="hero-image reveal-delay">
                    <img src="https://i.ibb.co/ksfCmJyy/casco.png" alt="POS System" />
                </div>
            </Hero>

            {/* Features Section */}
            <Features id="features">
                <h2 className="reveal">Todo lo que necesitas para <span>crecer</span></h2>
                <div className="features-grid">
                    <FeatureCard className="reveal">
                        <div className="icon"><FaChartBar /></div>
                        <h3>Reportes Detallados</h3>
                        <p>Visualiza tus ganancias y movimientos en tiempo real con gráficos interactivos.</p>
                    </FeatureCard>
                    <FeatureCard className="reveal">
                        <div className="icon"><FaStore /></div>
                        <h3>Multi-Sucursal</h3>
                        <p>Gestiona múltiples sucursales y almacenes desde una sola cuenta centralizada.</p>
                    </FeatureCard>
                    <FeatureCard className="reveal">
                        <div className="icon"><FaUsers /></div>
                        <h3>Control de Usuarios</h3>
                        <p>Asigna permisos específicos a tus empleados para mantener la seguridad.</p>
                    </FeatureCard>
                    <FeatureCard className="reveal">
                        <div className="icon"><FaRocket /></div>
                        <h3>Rápido y Seguro</h3>
                        <p>Infraestructura en la nube con Supabase para garantizar velocidad y respaldo.</p>
                    </FeatureCard>
                </div>
            </Features>

            {/* Pricing Section */}
            <Pricing id="pricing">
                <h2 className="reveal">Planes diseñados para tu <span>éxito</span></h2>
                <p className="subtitle reveal">Comienza con 30 días gratis en cualquier plan</p>

                <div className="pricing-grid">
                    {planes.map((plan) => (
                        <PriceCard key={plan.id} $popular={plan.popular} className="reveal">
                            {plan.popular && <div className="popular-badge">Más Elegido</div>}
                            <h3>{plan.nombre}</h3>
                            <div className="price-container">
                                {plan.precioOriginal && (
                                    <span className="old-price">
                                        ${plan.precioOriginal.toLocaleString()}
                                    </span>
                                )}
                                <span className="price">
                                    ${plan.precioMensual.toLocaleString()}
                                </span>
                                <span className="period">/mes</span>
                            </div>
                            <div className="discount-tag">25% OFF APLICADO</div>

                            <ul className="benefits">
                                <li><FaCheckCircle /> {plan.sucursales}</li>
                                {plan.beneficios.map((b, i) => (
                                    <li key={i}><FaCheckCircle /> {b}</li>
                                ))}
                            </ul>

                            <Btn1
                                titulo="Elegir Plan"
                                bgcolor={plan.popular ? v.colorPrincipal : ({ theme }) => theme.bg4}
                                color={plan.popular ? "#fff" : ({ theme }) => theme.text}
                                width="100%"
                                funcion={loginGoogle}
                            />
                        </PriceCard>
                    ))}
                </div>
            </Pricing>

            {/* Footer */}
            <Footer>
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src={v.logo} alt="Logo" />
                        <span>POS VENTAS</span>
                        <p>© 2026 Todos los derechos reservados.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Producto</h4>
                        <a href="#features">Funciones</a>
                        <a href="#pricing">Precios</a>
                    </div>
                    <div className="footer-links">
                        <h4>Compañía</h4>
                        <a href="#">Sobre nosotros</a>
                        <a href="#">Contacto</a>
                    </div>
                </div>
            </Footer>
        </Container>
    );
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  min-height: 100vh;
  overflow-x: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 5%;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.bgtotal}dd;
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid ${({ theme }) => theme.bg4};

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    font-size: 1.2rem;
    img { width: 40px; }
  }

  .nav-btns {
    display: flex;
    align-items: center;
    gap: 20px;
    .btn-login {
      background: none;
      border: none;
      color: ${({ theme }) => theme.text};
      font-weight: 600;
      cursor: pointer;
      &:hover { color: ${v.colorPrincipal}; }
    }
  }
`;

const Hero = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 5%;
  gap: 50px;

  @media ${Device.tablet} {
    flex-direction: column;
    text-align: center;
  }

  .hero-content {
    flex: 1;
    h1 {
      font-size: 4rem;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 20px;
      span {
        background: linear-gradient(90deg, #1cb0f6, #009ee3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      @media ${Device.tablet} { font-size: 2.5rem; }
    }
    p {
      font-size: 1.2rem;
      color: ${({ theme }) => theme.colorSubtitle};
      margin-bottom: 35px;
      max-width: 600px;
    }
  }

  .hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    img {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 20px 50px rgba(0,0,0,0.2));
      animation: float 6s ease-in-out infinite;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

const Features = styled.section`
  padding: 100px 5%;
  text-align: center;
  h2 {
    font-size: 2.5rem;
    margin-bottom: 60px;
    span { color: ${v.colorPrincipal}; }
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.bgcards};
  padding: 40px;
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.boxshadow};
  transition: transform 0.3s;
  
  &:hover { transform: translateY(-10px); }
  
  .icon {
    font-size: 2.5rem;
    color: ${v.colorPrincipal};
    margin-bottom: 20px;
  }
  h3 { margin-bottom: 15px; }
  p { color: ${({ theme }) => theme.colorSubtitle}; }
`;

const Pricing = styled.section`
  padding: 100px 5%;
  text-align: center;
  background: ${({ theme }) => theme.bg4};
  
  h2 { font-size: 2.5rem; margin-bottom: 10px; span { color: ${v.colorPrincipal}; } }
  .subtitle { margin-bottom: 60px; color: #00ca91; font-weight: 700; }
  
  .pricing-grid {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
  }
`;

const PriceCard = styled.div`
  background: ${({ theme }) => theme.bgtotal};
  padding: 50px 40px;
  border-radius: 30px;
  width: 350px;
  position: relative;
  box-shadow: ${({ theme }) => theme.boxshadow};
  border: 2px solid ${({ $popular }) => $popular ? v.colorPrincipal : "transparent"};
  
  .popular-badge {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background: ${v.colorPrincipal};
    color: #fff;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
  }

  h3 { font-size: 1.5rem; margin-bottom: 25px; }
  
  .price-container {
    margin-bottom: 10px;
    .old-price {
      text-decoration: line-through;
      color: ${({ theme }) => theme.colorSubtitle};
      display: block;
      font-size: 1.1rem;
    }
    .price { font-size: 3rem; font-weight: 800; color: ${v.colorPrincipal}; }
    .period { color: ${({ theme }) => theme.colorSubtitle}; }
  }

  .discount-tag {
    background: #e6fffb;
    color: #00ca91;
    padding: 5px 12px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 30px;
    display: inline-block;
  }

  .benefits {
    list-style: none;
    padding: 0;
    margin-bottom: 40px;
    text-align: left;
    li {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      svg { color: #00ca91; }
    }
  }
`;

const Footer = styled.footer`
  padding: 80px 5%;
  border-top: 1px solid ${({ theme }) => theme.bg4};
  .footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 50px;
    @media ${Device.tablet} { grid-template-columns: 1fr; }
  }
  .footer-brand {
    img { width: 40px; margin-bottom: 15px; }
    span { display: block; font-weight: 800; margin-bottom: 10px; }
    p { color: ${({ theme }) => theme.colorSubtitle}; }
  }
  .footer-links {
    h4 { margin-bottom: 20px; }
    a {
      display: block;
      color: ${({ theme }) => theme.colorSubtitle};
      margin-bottom: 10px;
      text-decoration: none;
      &:hover { color: ${v.colorPrincipal}; }
    }
  }
`;
