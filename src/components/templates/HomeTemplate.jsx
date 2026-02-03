import styled from "styled-components";
import { LandingPagesWelcome } from "../organismos/LandingPages/LandingPagesWelcome";
import { useEmpresaStore } from "../../store/EmpresaStore";
import { useSuscripcionesStore } from "../../store/SuscripcionStore";
import { useUsuariosStore } from "../../store/UsuariosStore";
import { useEffect, useState } from "react";
import { Device } from "../../styles/breakpoints";

export function HomeTemplate() {
  const { dataempresa } = useEmpresaStore();
  const { dataSuscripcion, mostrarSuscripcion } = useSuscripcionesStore();
  const { datausuarios } = useUsuariosStore();
  const [diasRestantes, setDiasRestantes] = useState(null);
  const isSuperUser = datausuarios?.correo === "trees.sanjuan@gmail.com";
  const isTestUser = datausuarios?.correo === "nicocabj1234@gmail.com";

  useEffect(() => {
    if (dataempresa?.id) {
      mostrarSuscripcion({ id_empresa: dataempresa.id });
    }
  }, [dataempresa]);

  useEffect(() => {
    if (dataSuscripcion?.fecha_fin) {
      const hoy = new Date();
      const fin = new Date(dataSuscripcion.fecha_fin);
      const diferencia = fin - hoy;
      const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
      setDiasRestantes(dias);
    }
  }, [dataSuscripcion]);

  return (
    <Container>
      {!isSuperUser && diasRestantes !== null && diasRestantes >= 0 && (
        <Banner $urgency={diasRestantes <= 5}>
          <span>
            ⏳ Prueba Gratuita: Te quedan <b>{diasRestantes} días</b> para disfrutar de Premium.
          </span>
        </Banner>
      )}

      {!isSuperUser && (isTestUser || (diasRestantes !== null && diasRestantes < -10)) && (
        <Banner $urgency={true}>
          <span>
            💀 SISTEMA RALENTIZADO: Tu suscripción venció hace tiempo. Detectada mora en el pago.
          </span>
        </Banner>
      )}
      <LandingPagesWelcome />
    </Container>
  );
}

const Banner = styled.div`
  background-color: ${({ $urgency }) => ($urgency ? "#e74c3c" : "#f39c12")};
  color: white;
  text-align: center;
  padding: 5px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 0 0 10px 10px;
  margin-bottom: 5px;
  animation: slideIn 0.5s ease-out;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);

  @keyframes slideIn {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  b {
    font-weight: 800;
    font-size: 1.1em;
  }
`;

const Container = styled.div`
  height: 100vh;
  position: relative;
`;
