import styled from "styled-components";
import { ButtonDashed } from "../ui/buttons/ButtonDashed";
import { ListSucursales } from "../organismos/SucursalesDesign/ListSucursales";
import { RegistrarSucursal } from "../organismos/formularios/RegistrarSucursal";
import { Toaster } from "sonner";
import { useSucursalesStore } from "../../store/SucursalesStore";
import { useEmpresaStore } from "../../store/EmpresaStore";
import { useCajasStore } from "../../store/CajasStore";
import { RegistrarCaja } from "../organismos/formularios/RegistrarCaja"
import { AnimatedGrid } from "../ui/animated/AnimatedGrid"
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useSuscripcionesStore } from "../../store/SuscripcionStore";
import { useUsuariosStore } from "../../store/UsuariosStore";
export const SucursalesCajasTemplate = () => {
  const navigate = useNavigate();
  const { dataSuscripcion } = useSuscripcionesStore();
  const { stateSucursal, setStateSucursal, dataSucursales } = useSucursalesStore();
  const { stateCaja } = useCajasStore();
  const { dataempresa } = useEmpresaStore();
  const { datausuarios } = useUsuariosStore();

  const planId = dataempresa?.id_plan;
  const cantidadSucursales = dataSucursales?.length || 0;

  // Lista de IDs por tipo de plan
  const idsPlanInicial = [3, 6];
  const idsPlanPro = [7, 8];

  const isSuperUser = datausuarios?.correo === "trees.sanjuan@gmail.com";

  const isPlanInicialLimit = idsPlanInicial.includes(planId) && cantidadSucursales >= 1;
  const isPlanProLimit = idsPlanPro.includes(planId) && cantidadSucursales >= 3;

  const limitReached = !isSuperUser && (isPlanInicialLimit || isPlanProLimit);

  const handleAgregarSucursal = () => {
    setStateSucursal(true);
  };

  const handleMejorarPlan = () => {
    if (isPlanProLimit) {
      window.open("https://wa.me/549XXXXXXXXX", "_blank");
    } else {
      navigate("/planes");
    }
  }

  return (
    <Container>
      <Toaster position="top-right" />
      {
        stateSucursal && <RegistrarSucursal />
      }
      {
        stateCaja && <RegistrarCaja />
      }

      <section className="area1">
        <Header>
          <Title>Cajas por sucursal</Title>
          <Subtitle>gestiona tus sucursales y cajas</Subtitle>
          {
            limitReached ?
              <ButtonDashed title={isPlanProLimit ? "Contactar Soporte" : "Mejorar Plan"} funcion={handleMejorarPlan} />
              :
              <ButtonDashed title="agregar sucursal" funcion={handleAgregarSucursal} />
          }
        </Header>
      </section>
      <section className="area2">
        <ListSucursales />
      </section>
      {/* <AnimatedGrid/> */}
    </Container>
  );
};
const Container = styled.div`
  height: 100vh;
  display: grid;
  position: relative;
  grid-template:
    "area1" 300px
    "area2" auto;
  .area1 {
    grid-area: area1;
    /* background-color: rgba(7, 237, 45, 0.14); */
    display: flex;
    flex-direction: column;
  }
  .area2 {
    grid-area: area2;
    /* background-color: rgba(237, 7, 221, 0.14); */
    padding-bottom: 20px;
  }
`;
const Header = styled.div`
  margin-bottom: 20px;
  text-align: center;
  justify-content: center;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Title = styled.h3`
  font-size: 25px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;
const Subtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  margin: 5px 0 0;
`;
