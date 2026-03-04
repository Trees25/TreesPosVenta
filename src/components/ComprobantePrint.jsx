import styled from "styled-components";
import { Icon } from "@iconify/react";

export const ComprobantePrint = ({ venta, detalles, empresa, tipoComprobante, plantilla }) => {
    const config = plantilla?.contenido_json || {
        header: empresa?.nombre || "MI NEGOCIO",
        subheader: "Comprobante de Venta",
        footer: "¡Gracias por su compra!",
        showLogo: true
    };

    return (
        <PrintContainer id="comprobante-print">
            <Header>
                {config.showLogo && empresa?.logo && <img src={empresa.logo} alt="Logo" />}
                <div className="title">{config.header}</div>
                <div className="subtitle">{config.subheader}</div>
                <hr />
            </Header>

            <Info>
                <div className="row">
                    <span>Comprobante:</span>
                    <strong>{tipoComprobante?.nombre} {venta.numero_comprobante}</strong>
                </div>
                <div className="row">
                    <span>Fecha:</span>
                    <span>{new Date(venta.fecha).toLocaleString()}</span>
                </div>
                {venta.clientes_proveedores && (
                    <div className="row">
                        <span>Cliente:</span>
                        <span>{venta.clientes_proveedores.nombres}</span>
                    </div>
                )}
                <hr />
            </Info>

            <Table>
                <thead>
                    <tr>
                        <th>Cant.</th>
                        <th>Producto</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {detalles.map((d, i) => (
                        <tr key={i}>
                            <td>{d.cantidad}</td>
                            <td>{d.productos?.nombre || "Producto"}</td>
                            <td className="text-right">${d.subtotal}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Summary>
                <hr />
                <div className="row">
                    <span>Subtotal:</span>
                    <span>${venta.total_neto || (venta.total + (venta.descuento || 0))}</span>
                </div>
                {venta.descuento > 0 && (
                    <div className="row">
                        <span>Descuento:</span>
                        <span>-${venta.descuento}</span>
                    </div>
                )}
                <div className="row total">
                    <span>TOTAL:</span>
                    <span>${venta.total}</span>
                </div>
                <hr />
            </Summary>

            <Footer>
                <p>{config.footer}</p>
                <p className="powered">Sistema POS - Antigravity</p>
            </Footer>
        </PrintContainer>
    );
};

const PrintContainer = styled.div`
    width: 80mm; /* Ancho estándar ticket */
    padding: 5mm;
    background: white;
    color: black;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.2;
    @media print {
        width: 100%;
        margin: 0;
        padding: 0;
    }
    hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
`;

const Header = styled.header`
    text-align: center;
    margin-bottom: 10px;
    img { max-width: 50mm; margin-bottom: 5px; filter: grayscale(1); }
    .title { font-size: 16px; font-weight: 800; }
    .subtitle { font-size: 10px; opacity: 0.8; }
`;

const Info = styled.section`
    .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
`;

const Table = styled.table`
    width: 100%;
    margin: 10px 0;
    th { text-align: left; font-size: 10px; border-bottom: 1px solid #000; }
    td { padding: 3px 0; font-size: 11px; }
    .text-right { text-align: right; }
`;

const Summary = styled.section`
    .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
    .total { font-size: 16px; font-weight: 900; margin-top: 5px; }
`;

const Footer = styled.footer`
    text-align: center;
    margin-top: 20px;
    p { margin: 2px 0; }
    .powered { font-size: 8px; opacity: 0.5; margin-top: 10px; }
`;
