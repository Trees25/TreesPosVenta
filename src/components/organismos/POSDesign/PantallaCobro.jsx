import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { IngresoCobro } from "./IngresoCobro";
import { VisorTicketVenta } from "./VisorTicketVenta";
import { useVentasStore } from "../../../store/VentasStore";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
export function PantallaCobro() {
  const [stateVerticket, setStateVerticker] = useState(false);
  const { setStatePantallaCobro, tipocobro } = useVentasStore();
  const ingresoCobroRef = useRef();
  const { datadetalleventa } = useDetalleVentasStore();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Evita el comportamiento predeterminado de presionar Enter (como cerrar la vista)
        if (ingresoCobroRef.current) {
          ingresoCobroRef.current.mutateAsync();
        }
      }
    };
    // Añade el event listener al document
    document.addEventListener("keydown", handleKeyDown);
    // Limpia el event listener al desmontar el componente
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <Container>
      <section className="contentingresocobro">
        <article
          className="contentverticket"
          onClick={() =>
            setStatePantallaCobro({
              data: datadetalleventa,
              tipocobro: tipocobro,
            })
          }
        >
          <Icon className="icono" icon="ep:arrow-left-bold" />
          <span>volver</span>
        </article>

        {stateVerticket && (
          <VisorTicketVenta
            setState={() => setStateVerticker(!stateVerticket)}
          />
        )}
        <IngresoCobro ref={ingresoCobroRef} />
      </section>
    </Container>
  );
}
const Container = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 100;
  background-color: ${({ theme }) => theme.bgtotal};
  .contentingresocobro {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    height: 100%; 
    width: 100%;
    
    .contentverticket {
      align-self: flex-start; /* Move to left */
      margin-left: 20px;
      margin-top: 20px;
      cursor: pointer;
      display: flex;
      gap: 10px;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 200;
      
      span {
        font-weight: 700;
        font-size: 18px;
        color: ${({ theme }) => theme.text};
      }
      .icono {
        font-size: 30px;
        color: ${({ theme }) => theme.text};
      }
    }
  }
`;
