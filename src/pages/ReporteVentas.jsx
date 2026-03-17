import styled from "styled-components";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabase";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { VentaService } from "../services/VentaService";

import { ComprobantePrint } from "../components/ComprobantePrint";

export const ReporteVentas = () => {
    const { profile } = useAuthStore();
    const [reporte, setReporte] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Default: Últimos 30 días
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    
    const [fechaInicio, setFechaInicio] = useState(lastMonth.toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(today.toISOString().split('T')[0]);

    // Lista de ventas por usuario
    const [showSalesModal, setShowSalesModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [salesList, setSalesList] = useState([]);
    const [loadingSales, setLoadingSales] = useState(false);

    // Detalle de una venta específica
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleDetails, setSaleDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Impresión
    const [saleToPrint, setSaleToPrint] = useState(null);
    const [plantillas, setPlantillas] = useState([]);
    const [tiposComprobantes, setTiposComprobantes] = useState([]);

    useEffect(() => {
        const fetchConfigs = async () => {
            const { data: p } = await supabase.from("plantillas_comprobantes").select("*");
            const { data: t } = await supabase.from("tipo_comprobantes").select("*");
            setPlantillas(p || []);
            setTiposComprobantes(t || []);
        };
        fetchConfigs();
    }, []);

    useEffect(() => {
        if (profile?.empresa?.id) fetchReporte();
    }, [profile, fechaInicio, fechaFin]);

    const fetchReporte = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc("rpc_ventas_por_empleado", {
                p_id_empresa: profile.empresa.id,
                fecha_ini: fechaInicio,
                fecha_fin: fechaFin
            });

            if (error) throw error;
            setReporte(data || []);
        } catch (error) {
            toast.error("Error al cargar reporte: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUserSales = async (user) => {
        try {
            setSelectedUser(user);
            setShowSalesModal(true);
            setLoadingSales(true);
            const data = await VentaService.listarVentasUsuario(user.id_usuario, fechaInicio, fechaFin);
            setSalesList(data);
        } catch (error) {
            toast.error("Error al cargar ventas: " + error.message);
        } finally {
            setLoadingSales(false);
        }
    };

    const handleViewSaleDetail = async (sale) => {
        try {
            setSelectedSale(sale);
            setShowDetailModal(true);
            setLoadingDetails(true);
            const details = await VentaService.obtenerDetalleVenta(sale.id);
            setSaleDetails(details);
        } catch (error) {
            toast.error("Error al cargar detalle: " + error.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handlePrintHistory = () => {
        if (!selectedSale || !saleDetails) return;
        
        const tipoComp = tiposComprobantes.find(t => t.id === selectedSale.id_tipo_comprobante);
        const plantilla = plantillas.find(p => p.id_tipo_comprobante === selectedSale.id_tipo_comprobante);

        setSaleToPrint({
            venta: selectedSale,
            detalles: saleDetails.items,
            tipoComprobante: tipoComp,
            plantilla: plantilla
        });

        setTimeout(() => {
            window.print();
            setSaleToPrint(null);
        }, 300);
    };

    return (
        <Container>
            <Header className="animate-fade">
                <div className="left">
                    <HomeBtn to="/">🏠</HomeBtn>
                    <h1>Reporte de Ventas por Empleado 📈</h1>
                </div>
                <Filters>
                    <div className="filter-group">
                        <label>Desde:</label>
                        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>Hasta:</label>
                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                    </div>
                </Filters>
            </Header>

            <Content className="animate-up">
                {loading ? (
                    <LoadingState>Generando reporte...</LoadingState>
                ) : reporte.length === 0 ? (
                    <EmptyState>No hay ventas registradas en este período.</EmptyState>
                ) : (
                    <TableContainer className="glass premium-shadow">
                        <table>
                            <thead>
                                <tr>
                                    <th>Empleado</th>
                                    <th>Operaciones</th>
                                    <th>Total Vendido</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reporte.map((r, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="user-info">
                                                <div className="avatar">{r.nombre_usuario.charAt(0)}</div>
                                                <span>{r.nombre_usuario}</span>
                                            </div>
                                        </td>
                                        <td><Badge>{r.cantidad_operaciones} ventas</Badge></td>
                                        <td className="amount">${r.total_ventas.toLocaleString()}</td>
                                        <td>
                                            <button className="details" onClick={() => handleViewUserSales(r)}>Ver Detalles</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableContainer>
                )}
            </Content>

            {/* Modal de Lista de Ventas */}
            {showSalesModal && (
                <Overlay onClick={() => setShowSalesModal(false)}>
                    <Modal className="glass" onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>Ventas de {selectedUser?.nombre_usuario}</h3>
                            <button onClick={() => setShowSalesModal(false)}><Icon icon="mdi:close" /></button>
                        </ModalHeader>
                        <ModalBody>
                            {loadingSales ? (
                                <p>Cargando ventas...</p>
                            ) : salesList.length === 0 ? (
                                <p>No hay ventas en este rango.</p>
                            ) : (
                                <SimpleTable>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Total</th>
                                            <th>Pago</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salesList.map(s => (
                                            <tr key={s.id}>
                                                <td>{new Date(s.fecha).toLocaleString()}</td>
                                                <td className="bold">${s.total}</td>
                                                <td><Badge>{s.tipo_pago}</Badge></td>
                                                <td>
                                                    <button className="mini-btn" onClick={() => handleViewSaleDetail(s)}>Detalle</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </SimpleTable>
                            )}
                        </ModalBody>
                    </Modal>
                </Overlay>
            )}

            {/* Modal de Detalle de Venta */}
            {showDetailModal && (
                <Overlay onClick={() => setShowDetailModal(false)}>
                    <Modal className="glass small no-print" onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>Detalle de Venta #{selectedSale?.numero_comprobante || selectedSale?.id}</h3>
                            <button onClick={() => setShowDetailModal(false)}><Icon icon="mdi:close" /></button>
                        </ModalHeader>
                        <ModalBody>
                            {loadingDetails ? (
                                <p>Cargando detalles...</p>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                                        <button 
                                            onClick={handlePrintHistory}
                                            style={{ 
                                                background: profile?.primary || '#ff6a00', 
                                                color: 'white', 
                                                padding: '8px 15px', 
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Icon icon="mdi:printer" /> Re-imprimir Ticket
                                        </button>
                                    </div>
                                    <h4>Productos</h4>
                                    <SimpleTable>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cant.</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {saleDetails?.items.map((it, idx) => (
                                                <tr key={idx}>
                                                    <td>{it.productos?.nombre}</td>
                                                    <td>{it.cantidad}</td>
                                                    <td>${it.subtotal}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </SimpleTable>
                                    <h4 style={{ marginTop: '20px' }}>Pagos</h4>
                                    <SimpleTable>
                                        <thead>
                                            <tr>
                                                <th>Método</th>
                                                <th>Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {saleDetails?.pagos.map((p, idx) => (
                                                <tr key={idx}>
                                                    <td>{p.metodos_pago?.nombre ?? 'Otro'}</td>
                                                    <td>${p.monto}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </SimpleTable>
                                </>
                            )}
                        </ModalBody>
                    </Modal>
                </Overlay>
            )}

            {/* Contenedor de impresión oculto fuera del root */}
            {saleToPrint && createPortal(
                <div id="comprobante-print-container" className="only-print">
                    <ComprobantePrint
                        venta={saleToPrint.venta}
                        detalles={saleToPrint.detalles}
                        empresa={profile?.empresa}
                        tipoComprobante={saleToPrint.tipoComprobante}
                        plantilla={saleToPrint.plantilla}
                    />
                </div>,
                document.body
            )}
        </Container>
    );
};

const Container = styled.div` padding: 40px 5%; min-height: 100vh; background: ${({ theme }) => theme.bg}; `;
const Header = styled.header` display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; .left { display: flex; align-items: center; gap: 20px; h1 { margin: 0; font-size: 28px; font-weight: 900; } } `;
const HomeBtn = styled(Link)` background: ${({ theme }) => theme.softBg}; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid ${({ theme }) => theme.borderColor}44; text-decoration: none; font-size: 20px; transition: all 0.2s; &:hover { background: ${({ theme }) => theme.primary}22; border-color: ${({ theme }) => theme.primary}; transform: scale(1.05); } `;
const Filters = styled.div` display: flex; gap: 20px; .filter-group { display: flex; flex-direction: column; gap: 5px; label { font-size: 12px; font-weight: 700; color: ${({ theme }) => theme.text}88; text-transform: uppercase; } input { background: ${({ theme }) => theme.cardBg}; border: 1px solid ${({ theme }) => theme.borderColor}; color: ${({ theme }) => theme.text}; padding: 8px 15px; border-radius: 10px; font-weight: 600; } } `;
const Content = styled.div` margin-top: 20px; `;
const TableContainer = styled.div`
    background: ${({ theme }) => theme.cardBg};
    border-radius: 24px;
    border: 1px solid ${({ theme }) => theme.borderColor}33;
    overflow-x: auto;
    max-height: 65vh;
    overflow-y: auto;

    /* Scrollbar styles */
    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${({ theme }) => theme.primary}44;
        border-radius: 20px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background-color: ${({ theme }) => theme.primary};
    }

    table {
        width: 100%;
        border-collapse: collapse;
        th {
            position: sticky;
            top: 0;
            z-index: 10;
            text-align: left;
            padding: 20px;
            background: ${({ theme }) => theme.softBg};
            font-size: 12px;
            text-transform: uppercase;
            color: ${({ theme }) => theme.text}88;
            font-weight: 800;
            &::after {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                border-bottom: 1px solid ${({ theme }) => theme.borderColor}22;
            }
        }
        td {
            padding: 20px;
            border-bottom: 1px solid ${({ theme }) => theme.borderColor}22;
            &.amount {
                font-weight: 900;
                font-size: 18px;
                color: ${({ theme }) => theme.primary};
            }
        }
    }
    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        .avatar {
            width: 32px;
            height: 32px;
            background: ${({ theme }) => theme.primary};
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 14px;
        }
    }
    .details {
        background: ${({ theme }) => theme.softBg};
        color: ${({ theme }) => theme.text};
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        &:hover {
            background: ${({ theme }) => theme.primary}22;
            color: ${({ theme }) => theme.primary};
        }
    }
`;
const Badge = styled.span` background: #2ecc7122; color: #2ecc71; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; `;
const LoadingState = styled.div` text-align: center; padding: 100px; color: ${({ theme }) => theme.primary}; font-weight: 800; font-size: 20px; `;
const EmptyState = styled.div` text-align: center; padding: 100px; color: ${({ theme }) => theme.text}44; font-size: 18px; font-weight: 600; `;

const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
`;

const Modal = styled.div`
    background: ${({ theme }) => theme.cardBg};
    width: 90%;
    max-width: 800px;
    border-radius: 24px;
    padding: 30px;
    max-height: 80vh;
    display: flex; flex-direction: column;
    border: 1px solid ${({ theme }) => theme.borderColor}33;
    &.small { max-width: 500px; }
`;

const ModalHeader = styled.div`
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px;
    h3 { margin: 0; font-size: 20px; font-weight: 800; }
    button { background: none; border: none; font-size: 24px; color: ${({ theme }) => theme.text}88; cursor: pointer; }
`;

const ModalBody = styled.div`
    flex: 1; overflow-y: auto;
    h4 { margin: 15px 0 10px; font-size: 16px; color: ${({ theme }) => theme.primary}; }

    /* Scrollbar styles */
    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${({ theme }) => theme.primary}44;
        border-radius: 20px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background-color: ${({ theme }) => theme.primary};
    }
`;

const SimpleTable = styled.table`
    width: 100%; border-collapse: collapse;
    th { text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; color: ${({ theme }) => theme.text}66; }
    td { padding: 12px; border-bottom: 1px solid ${({ theme }) => theme.borderColor}11; font-size: 14px; 
        &.bold { font-weight: 700; }
    }
    .mini-btn {
        background: ${({ theme }) => theme.primary}22;
        color: ${({ theme }) => theme.primary};
        padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
    }
`;
