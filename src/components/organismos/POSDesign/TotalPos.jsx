import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { Device } from "../../../styles/breakpoints";
import { Icon } from "@iconify/react";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useVentasStore } from "../../../store/VentasStore";
import { FormatearNumeroDinero } from "../../../utils/Conversiones"
import { useValidarPermisosOperativos } from "../../../hooks/useValidarPermisosOperativos"
import { ModalCobro } from "./ModalCobro";
import { useState } from "react";

export function TotalPos() {
  const { setStateMetodosPago } = useVentasStore()
  const { total, totalNeto, descuento, tipoDescuento } = useDetalleVentasStore()
  const { dataempresa } = useEmpresaStore()
  const { validarPermiso } = useValidarPermisosOperativos()
  const [openModalCobro, setOpenModalCobro] = useState(false);

  const validarPermisoCobrar = () => {
    const hasPermission = validarPermiso("Cobrar venta")
    if (!hasPermission) return;
    // Mobile: Open Modal
    setOpenModalCobro(true);
  }

  return (
    <Container>
      {openModalCobro && <ModalCobro onClose={() => setOpenModalCobro(false)} />}
      <section className="imagen">
        <Icon icon="noto:money-with-wings" width="60" />
      </section>
      <section className="contentTotal">
        <section className="contentTituloTotal">
          <Btn1 border="2px" bgcolor="#ffffff" color="#207c33" funcion={validarPermisoCobrar} titulo="COBRAR" icono={<Icon icon="fluent-emoji:money-with-wings" />} />

        </section>

        {descuento > 0 && (
          <div className="discount-info">
            <span className="neto">
              {FormatearNumeroDinero(totalNeto, dataempresa?.currency, dataempresa?.iso)}
            </span>
            <span className="discount-badge">
              -{tipoDescuento === "porcentaje" ? `${descuento}%` : FormatearNumeroDinero(descuento, dataempresa?.currency, dataempresa?.iso)}
            </span>
          </div>
        )}
        <span>{FormatearNumeroDinero(total, dataempresa?.currency, dataempresa?.iso)}</span>

      </section>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  text-align: center;
  justify-content: space-between;
  border-radius: 15px;
  font-weight: 700;
  font-size: 26px;
  background-color: #3ff563;
  padding: 8px;
  color: #207c33;
  position: relative;
  overflow: hidden;
  &::after {
    content: "";
    display: block;
    width: 80px;
    height: 80px;
    background-color: #7fff99;
    position: absolute;
    border-radius: 50%;
    top: -20px;
    left: -15px;
  }
  &::before {
    content: "";
    display: block;
    width: 20px;
    height: 20px;
    background-color: ${({ theme }) => theme.bgtotal};
    position: absolute;
    border-radius: 50%;
    top: 5px;
    right: 5px;
  }
  .imagen {
    z-index: 1;
    width: 55px;
   
    position: relative;
    @media ${Device.desktop} {
      bottom: initial;
    }
    img {
      width: 100%;
    }
  }
  .contentTotal {
    z-index:10;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end; /* Align right to keep numbers aligned */
    
    .discount-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: -5px;
      
      .neto {
        font-size: 20px;
        text-decoration: line-through;
        color: rgba(32, 124, 51, 0.7);
        font-weight: 500;
      }
      .discount-badge {
        font-size: 14px;
        background-color: #ef4444;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: bold;
      }
    }

    .contentTituloTotal {
      display: flex;
      align-items: center;
      position: relative;
      margin-top: 30px;
      justify-content:end;
      align-content:end;
      @media ${Device.desktop} {
        display: none;
      }
    }
  }
`;
