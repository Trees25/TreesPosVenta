import styled from "styled-components";
import { useAuthStore } from "../store/AuthStore";
import { Link } from "react-router-dom";

export const SubscriptionStatus = () => {
  const { profile } = useAuthStore();
  const sub = profile?.suscripcion;

  if (!sub) return null;

  const dias = Math.floor(sub.dias_restantes || 30);
  const isTrial = sub.estado === 'trial';
  const isExpired = sub.estado === 'vencido' || dias < 0;
  const isPaid = sub.estado === 'activo';

  // Ocultar si está pagado y faltan más de 7 días
  if (isPaid && dias > 7) return null;

  // Determinar color basado en urgencia
  let statusColor = "#4ade80"; // Verde (OK)
  if (dias < 0) statusColor = "#f87171"; // Rojo (Vencido)
  else if (dias <= 7) statusColor = "#fb923c"; // Naranja (Alerta)

  const isAdmin = profile?.id_rol === 1 || profile?.roles?.nombre === 'admin';

  return (
    <FloatingContainer style={{ borderColor: statusColor }}>
      <div className="status-dot" style={{ backgroundColor: statusColor }} />
      <div className="info">
        <span className="label" style={{ color: isTrial ? "#ff6a00" : "rgba(255, 255, 255, 0.5)" }}>
          {isTrial ? "🎁 Prueba: 30 Días Gratis" : "Plan Activo"}
        </span>
        <span className="days">
          {dias < 0 ? "⚠️ Suscripción Vencida" : `${dias} días restantes`}
        </span>
      </div>
      {isAdmin ? (
        <Link to="/planes" className="pay-btn">
          {dias < 0 ? "Pagar Ahora" : "Ver Planes"}
        </Link>
      ) : (
        <StaffMessage>
          {dias < 0
            ? "⚠️ Plan Vencido: Consulta con el Admin"
            : "El Admin gestiona el plan"
          }
        </StaffMessage>
      )}
    </FloatingContainer>
  );
};

const StaffMessage = styled.div`
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 12px;
    border-radius: 8px;
    font-weight: 600;
    max-width: 120px;
    line-height: 1.2;
    text-align: center;
`;

const FloatingContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  padding: 12px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 999;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 10px currentColor;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
    100% { transform: scale(1); opacity: 1; }
  }

  .info {
    display: flex;
    flex-direction: column;
    .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 700;
    }
    .days {
      font-size: 14px;
      color: white;
      font-weight: 600;
    }
  }

  .pay-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    padding: 6px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  }
`;
