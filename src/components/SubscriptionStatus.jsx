import styled from "styled-components";
import { useAuthStore } from "../store/AuthStore";
import { Link } from "react-router-dom";

export const SubscriptionStatus = () => {
  const { profile } = useAuthStore();
  const sub = profile?.suscripcion;
  if (!profile) return null;

  const dias = sub ? sub.dias_restantes : 30;
  const isTrial = sub ? sub.estado === 'trial' : true;
  const noSub = !sub;

  // Lógica de periodo de gracia (10 días posterior al vencimiento)
  const isGracePeriod = dias < 0 && dias >= -10;
  const isExpired = dias < -10;
  
  // Colores discretos y elegantes
  let statusColor = "#4ade80"; // Verde (Activo)
  if (isExpired || noSub) statusColor = "#f87171"; // Rojo (Vencido/Bloqueado)
  else if (isGracePeriod) statusColor = "#ef4444"; // Rojo intenso (Mora)
  else if (dias <= 5) statusColor = "#fb923c"; // Naranja (Por vencer)

  const isAdmin = profile?.id_rol === 1 || profile?.roles?.nombre === 'admin';

  return (
    <FloatingPill style={{ borderLeft: `4px solid ${statusColor}` }}>
      <div className="main-info">
        <span className="label">
          {noSub || isTrial ? "🎁 Prueba Gratuita" : "Plan Activo"}
        </span>
        <span className="days" style={{ color: (noSub || dias <= 5 || dias < 0) ? statusColor : "inherit" }}>
          {isExpired ? "⚠️ Suscripción Vencida" : 
           isGracePeriod ? `⚠️ Vencida (Gracia: ${10 + dias}d)` :
           `${dias} días restantes`}
        </span>
      </div>
      
      {isAdmin && (noSub || dias <= 7 || dias < 0) && (
        <Link to="/planes" className="action-link" style={isExpired ? {background: '#f87171'} : {}}>
          {dias < 0 ? "Renovar Ahora" : "Extender"}
        </Link>
      )}
    </FloatingPill>
  );
};

const FloatingPill = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${({ theme }) => theme.cardBg};
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.borderColor}44;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 9999;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  font-family: inherit;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .main-info {
    display: flex;
    flex-direction: column;
    
    .label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
      font-weight: 700;
    }
    .days {
      font-size: 13px;
      font-weight: 800;
    }
  }

  .action-link {
    background: ${({ theme }) => theme.primary};
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    transition: filter 0.2s;
    
    &:hover {
      filter: brightness(1.1);
    }
  }

  @media (max-width: 768px) {
    bottom: 15px;
    right: 15px;
    padding: 6px 12px;
  }
`;
