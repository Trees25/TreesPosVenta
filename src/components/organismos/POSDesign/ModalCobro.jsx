import styled from "styled-components";
import { Device } from "../../../styles/breakpoints";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useVentasStore } from "../../../store/VentasStore";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { Btn1 } from "../../moleculas/Btn1";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { ModalDescuento } from "./ModalDescuento";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";

export function ModalCobro({ onClose }) {
    const { dataMetodosPago } = useMetodosPagoStore();
    const { setStatePantallaCobro } = useVentasStore();
    const { dataempresa } = useEmpresaStore();
    const { datadetalleventa, total } = useDetalleVentasStore();
    const [openDescuento, setOpenDescuento] = useState(false);

    const handleCobrar = (metodo) => {
        setStatePantallaCobro({ data: datadetalleventa, tipocobro: metodo.nombre });
        onClose();
    };

    return (
        <Container>
            {openDescuento && <ModalDescuento onClose={() => setOpenDescuento(false)} />}
            <div className="sub-container">
                <div className="header">
                    <h2>Medios de Pago</h2>
                    <span className="close" onClick={onClose}>
                        <Icon icon="mdi:close" />
                    </span>
                </div>

                <div className="total-display">
                    <span>Total a Cobrar:</span>
                    <strong>{FormatearNumeroDinero(total, dataempresa?.currency, dataempresa?.iso)}</strong>
                </div>

                <div className="actions">
                    <Btn1
                        titulo="Aplicar Descuento"
                        icono={<Icon icon="ri:discount-percent-fill" width="20" />}
                        bgcolor="#FFB74D"
                        color="#000"
                        width="100%"
                        funcion={() => setOpenDescuento(true)}
                    />
                </div>

                <div className="payment-methods">
                    {dataMetodosPago?.map((item, index) => (
                        <Btn1
                            key={index}
                            imagen={item.icono !== "-" ? item.icono : null}
                            funcion={() => handleCobrar(item)}
                            titulo={item.nombre}
                            border="0"
                            height="60px"
                            width="100%"
                        />
                    ))}
                </div>
            </div>
        </Container>
    );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: end; /* Bottom sheet on mobile */
  z-index: 1000;

  @media ${Device.desktop} {
      align-items: center;
  }

  .sub-container {
    width: 100%;
    max-height: 80vh;
    background-color: ${({ theme }) => theme.bgtotal};
    border-radius: 20px 20px 0 0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    animation: slideUp 0.3s ease-out;
    overflow-y: auto;

    @media ${Device.desktop} {
        width: 400px;
        border-radius: 20px;
        align-items: center;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      h2 {
        margin: 0;
        font-size: 1.2rem;
      }
      .close {
        font-size: 1.5rem;
        cursor: pointer;
      }
    }

    .total-display {
        display: flex;
        justify-content: space-between;
        font-size: 1.2rem;
        padding: 10px;
        background-color: ${({ theme }) => theme.bg};
        border-radius: 10px;
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }
    
    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
  }
`;
