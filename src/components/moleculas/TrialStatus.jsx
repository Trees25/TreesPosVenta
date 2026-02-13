import styled, { keyframes } from "styled-components";
import { Device } from "../../styles/breakpoints";
import { useNavigate } from "react-router-dom";

export function TrialStatus({ fechaVencimiento }) {
  const navigate = useNavigate();

  if (!fechaVencimiento) return null;

  const now = new Date();
  const diffTime = new Date(fechaVencimiento) - now;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Si ya venció
  if (daysRemaining <= 0) {
    return (
      <Container $expired={true} onClick={() => navigate("/planes")}>
        <Content>
          <span className="icon">⚠️</span>
          <span className="text">
            Tu periodo de prueba ha finalizado. <strong>Haz click aquí para suscribirte</strong> y evitar el bloqueo.
          </span>
        </Content>
      </Container>
    );
  }

  // Si faltan 7 días o menos
  if (daysRemaining <= 7) {
    return (
      <Container $expired={false} onClick={() => navigate("/planes")}>
        <Content>
          <span className="icon">⏳</span>
          <span className="text">
            Te quedan <strong>{daysRemaining} días</strong> de prueba gratuita. Suscríbete ahora.
          </span>
        </Content>
      </Container>
    );
  }

  return null;
}

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Container = styled.div`
  width: 100%;
  background-color: ${({ $expired }) => ($expired ? "#ef4444" : "#f59e0b")};
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  animation: ${slideDown} 0.5s ease-out;
  position: relative;
  z-index: 9999;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    filter: brightness(1.05);
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;

  .icon {
    font-size: 18px;
  }

  @media ${Device.mobile} {
    font-size: 12px;
    .icon {
      font-size: 16px;
    }
  }
`;
