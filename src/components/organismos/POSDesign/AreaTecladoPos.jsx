import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { TotalPos } from "./TotalPos";
import { Device } from "../../../styles/breakpoints";
import { useVentasStore } from "../../../store/VentasStore";

import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useQuery } from "@tanstack/react-query";
import { useValidarPermisosOperativos } from "../../../hooks/useValidarPermisosOperativos";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { ModalDescuento } from "./ModalDescuento";
import { useState } from "react";
import { Icon } from "@iconify/react";
export function AreaTecladoPos() {
  const { setStatePantallaCobro, stateMetodosPago } = useVentasStore();
  const { dataempresa } = useEmpresaStore();
  const { dataMetodosPago: datametodospago } = useMetodosPagoStore();
  const { datadetalleventa } = useDetalleVentasStore()
  const { validarPermiso } = useValidarPermisosOperativos();
  const [openDescuento, setOpenDescuento] = useState(false);
  // const { data: datametodospago } = useQuery({
  //   queryKey: ["mostrar metodos de pago"],
  //   queryFn: () => mostrarMetodosPago({ id_empresa: dataempresa?.id }),
  //   enabled: !!dataempresa,
  // });
  const ValidarPermisocobrar = (p) => {
    const response = validarPermiso("Cobrar venta");
    if (!response) return;
    console.log("tipocobro", p.nombre)
    setStatePantallaCobro({ data: datadetalleventa, tipocobro: p.nombre });
  };

  return (
    <Container stateMetodosPago={stateMetodosPago}>
      {/* Modal de Descuento */}
      {openDescuento && <ModalDescuento onClose={() => setOpenDescuento(false)} />}

      <section className="areatipopago">
        {datametodospago?.map((item, index) => {
          return (
            <article className="box" key={index}>
              <Btn1
                imagen={item.icono != "-" ? item.icono : null}
                funcion={() => ValidarPermisocobrar(item)}
                titulo={item.nombre}
                border="0"
                height="55px"
                width="100%"
              />
            </article>
          );
        })}
      </section>
      <section className="totales">
        <div className="acciones-extra">
          <Btn1
            titulo="Descuento"
            icono={<Icon icon="ri:discount-percent-fill" width="20" />}
            bgcolor="#FFB74D"
            color="#000"
            width="100%"
            funcion={() => setOpenDescuento(true)}
          />
        </div>
        <TotalPos />
      </section>
    </Container>
  );
}
const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.color2};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  /* Mobile: Static/Relative flow */
  position: relative; 
  width: 100%;
  border-radius: 15px;
  
  @media ${Device.desktop} {
    position: relative;
    width: 400px;
    bottom: initial;
  }
  .areatipopago {
    display: none; /* Hidden on mobile */
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    @media ${Device.desktop} {
      display: flex; /* Visible on desktop */
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px;
    }
    .box {
      flex: 1 1 40%;
      display: flex;
      gap: 10px;
    }
  }
  .totales {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    .subtotal {
      display: none;
      flex-direction: column;
      justify-content: end;
      text-align: end;
      gap: 10px;
      font-weight: 500;
      @media ${Device.desktop} {
        display: flex;
      }
    }
    .acciones-extra {
      margin-bottom: 10px;
      display: none; /* Hidden on mobile */
      @media ${Device.desktop} {
         display: block;
      }
    }
  }
`;
