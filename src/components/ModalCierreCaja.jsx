import styled from "styled-components";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CajaService } from "../services/CajaService";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useAuthStore } from "../store/AuthStore";

export const ModalCierreCaja = ({ idCierre, onClose, onCierreExitoso }) => {
    const { profile } = useAuthStore();
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [montoReal, setMontoReal] = useState("");
    const [cierreFinalizado, setCierreFinalizado] = useState(false);

    useEffect(() => {
        if (idCierre) fetchResumen();
    }, [idCierre]);

    const fetchResumen = async () => {
        try {
            setLoading(true);
            const data = await CajaService.obtenerResumenCaja(idCierre);
            setResumen(data);
            setMontoReal(data.efectivo_esperado.toString());
        } catch (error) {
            toast.error("Error al obtener resumen: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const diferencia = resumen ? (parseFloat(montoReal) || 0) - resumen.efectivo_esperado : 0;

    const handleConfirmarCierre = async () => {
        try {
            setLoading(true);
            await CajaService.cerrarCaja(idCierre, {
                monto_cierre: parseFloat(montoReal) || 0,
            });
            setCierreFinalizado(true);
            toast.success("Caja cerrada exitosamente");
        } catch (error) {
            toast.error("Error al cerrar caja: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizar = () => {
        onCierreExitoso();
    };

    if (loading && !resumen) {
        return (
            <Overlay>
                <ModalContainer>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Icon icon="line-md:loading-twotone-loop" style={{ fontSize: '40px' }} />
                        <p>Generando resumen de caja...</p>
                    </div>
                </ModalContainer>
            </Overlay>
        );
    }

    if (cierreFinalizado) {
        return (
            <Overlay>
                <ModalContainer style={{ textAlign: 'center' }}>
                    <div className="no-print">
                        <div style={{ fontSize: '60px', color: '#2ecc71' }}>✅</div>
                        <h2>Turno Finalizado</h2>
                        <p>La caja ha sido cerrada correctamente.</p>
                    </div>

                    {createPortal(
                        <div id="reporte-cierre-container" className="only-print">
                            <ReporteImpresion resumen={resumen} montoReal={montoReal} diferencia={diferencia} />
                        </div>,
                        document.body
                    )}

                    <Footer className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                        <ActionBtn className="confirm" onClick={() => window.print()} style={{ flex: 1 }}>
                            <Icon icon="mdi:printer" /> Imprimir Informe
                        </ActionBtn>
                        <ActionBtn className="secondary" onClick={handleFinalizar} style={{ flex: 1 }}>
                            Finalizar
                        </ActionBtn>
                    </Footer>
                </ModalContainer>
            </Overlay>
        );
    }

    return (
        <Overlay className="animate-fade">
            <ModalContainer className="glass premium-shadow animate-scale">
                <Header>
                    <div>
                        <h2>Cierre de Caja</h2>
                        <span className="subtitle">Resumen de movimientos del turno</span>
                    </div>
                    <button className="close" onClick={onClose}><Icon icon="mdi:close" /></button>
                </Header>

                <ScrollContent>
                    <ResumenCards>
                        <Card className="opening">
                            <span className="label">Apertura</span>
                            <span className="value">${resumen.monto_apertura}</span>
                        </Card>
                        <Card className="expected">
                            <span className="label">Efectivo Esperado</span>
                            <span className="value">${resumen.efectivo_esperado}</span>
                        </Card>
                    </ResumenCards>

                    <SectionTitle>Ventas por Método</SectionTitle>
                    <ListItems>
                        {Object.entries(resumen.ingresos).map(([metodo, monto]) => (
                            <Item key={metodo}>
                                <div className="info">
                                    <Icon icon={metodo.toLowerCase() === 'efectivo' ? 'mdi:cash' : 'mdi:credit-card'} />
                                    <span>{metodo}</span>
                                </div>
                                <span className="amount">${monto}</span>
                            </Item>
                        ))}
                    </ListItems>

                    {resumen.total_egresos > 0 && (
                        <>
                            <SectionTitle>Egresos de Caja</SectionTitle>
                            <ListItems>
                                <Item className="expense">
                                    <div className="info">
                                        <Icon icon="mdi:cash-minus" />
                                        <span>Total Egresos</span>
                                    </div>
                                    <span className="amount">-${resumen.total_egresos}</span>
                                </Item>
                            </ListItems>
                        </>
                    )}

                    <ConfirmationBox>
                        <label>Confirmar Efectivo Real en Caja</label>
                        <div className="input-group">
                            <Icon icon="mdi:cash-register" className="prefix" />
                            <input
                                type="number"
                                value={montoReal}
                                onChange={(e) => setMontoReal(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <DiferenciaBadge $diferencia={diferencia}>
                            {diferencia === 0 ? (
                                <><Icon icon="mdi:check-circle" /> Caja Cuadrada</>
                            ) : diferencia > 0 ? (
                                <><Icon icon="mdi:trending-up" /> Sobrante: ${diferencia}</>
                            ) : (
                                <><Icon icon="mdi:trending-down" /> Faltante: ${Math.abs(diferencia)}</>
                            )}
                        </DiferenciaBadge>
                    </ConfirmationBox>
                </ScrollContent>

                <Footer>
                    <ActionBtn className="confirm" onClick={handleConfirmarCierre} disabled={loading}>
                        {loading ? "Cerrando..." : "Confirmar y Cerrar Caja"}
                    </ActionBtn>
                </Footer>
            </ModalContainer>
        </Overlay>
    );
};

const ReporteImpresion = ({ resumen, montoReal, diferencia }) => (
    <ReporteContainer>
        <h3 style={{ textAlign: 'center' }}>INFORME DE CIERRE DE CAJA</h3>
        <p style={{ textAlign: 'center', fontSize: '10px' }}>Fecha: {new Date().toLocaleString()}</p>
        <hr />
        <div className="row"><span>Monto Apertura:</span> <span>${resumen.monto_apertura}</span></div>
        <hr />
        <h4>Ingresos por Venta</h4>
        {Object.entries(resumen.ingresos).map(([metodo, monto]) => (
            <div className="row" key={metodo}><span>{metodo}:</span> <span>${monto}</span></div>
        ))}
        <hr />
        <div className="row"><span>Total Egresos:</span> <span>-${resumen.total_egresos}</span></div>
        <div className="row"><strong>Esperado en Efectivo:</strong> <strong>${resumen.efectivo_esperado}</strong></div>
        <div className="row"><strong>Real en Efectivo:</strong> <strong>${montoReal}</strong></div>
        <div className="row"><strong>Diferencia:</strong> <strong>${diferencia}</strong></div>
        <hr />
        <p style={{ textAlign: 'center', fontSize: '8px', marginTop: '20px' }}>*** Fin del Reporte ***</p>
    </ReporteContainer>
);

const Overlay = styled.div` position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(8px); `;
const ModalContainer = styled.div` 
    background: ${({ theme }) => theme.cardBg}; 
    width: 100%; 
    max-width: 450px; 
    max-height: 90vh;
    border-radius: 24px; 
    border: 1px solid ${({ theme }) => theme.borderColor}55; 
    padding: 30px; 
    display: flex; 
    flex-direction: column; 
    gap: 20px; 
    overflow-y: auto;
    
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.primary}44; border-radius: 10px; }
`;
const Header = styled.div` display: flex; justify-content: space-between; align-items: flex-start; h2 { margin: 0; font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.primary}; } .subtitle { font-size: 13px; opacity: 0.6; } .close { background: none; border: none; font-size: 24px; cursor: pointer; color: ${({ theme }) => theme.text}55; } `;
const ScrollContent = styled.div` 
    overflow-y: auto; 
    max-height: 60vh; 
    padding-right: 5px; 

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
const ResumenCards = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; `;
const Card = styled.div` padding: 15px; border-radius: 16px; display: flex; flex-direction: column; gap: 5px; .label { font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: 0.7; } .value { font-size: 20px; font-weight: 900; } &.opening { background: ${({ theme }) => theme.primary}11; color: ${({ theme }) => theme.primary}; } &.expected { background: #2ecc7111; color: #2ecc71; } `;
const SectionTitle = styled.h4` font-size: 12px; text-transform: uppercase; margin: 20px 0 10px; opacity: 0.5; letter-spacing: 1px; `;
const ListItems = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Item = styled.div` display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: ${({ theme }) => theme.softBg}; border-radius: 12px; font-weight: 600; .info { display: flex; align-items: center; gap: 10px; font-size: 14px; opacity: 0.8; } .amount { font-size: 16px; font-weight: 700; } &.expense { color: #e74c3c; } `;
const ConfirmationBox = styled.div` margin-top: 25px; padding: 20px; background: ${({ theme }) => theme.borderColor}22; border-radius: 18px; border: 1px solid ${({ theme }) => theme.borderColor}44; label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 15px; text-align: center; } .input-group { position: relative; display: flex; align-items: center; .prefix { position: absolute; left: 15px; font-size: 24px; color: ${({ theme }) => theme.primary}; } input { width: 100%; padding: 15px 15px 15px 50px; border-radius: 12px; border: 2px solid ${({ theme }) => theme.primary}44; background: ${({ theme }) => theme.cardBg}; color: ${({ theme }) => theme.text}; font-size: 24px; font-weight: 900; text-align: center; &:focus { border-color: ${({ theme }) => theme.primary}; outline: none; } } } `;
const DiferenciaBadge = styled.div` margin-top: 15px; padding: 10px; border-radius: 10px; text-align: center; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; background: ${props => props.$diferencia === 0 ? '#2ecc7122' : props.$diferencia > 0 ? '#3498db22' : '#e74c3c22'}; color: ${props => props.$diferencia === 0 ? '#2ecc71' : props.$diferencia > 0 ? '#3498db' : '#e74c3c'}; `;
const Footer = styled.div` margin-top: 10px; `;
const ActionBtn = styled.button` width: 100%; padding: 16px; border-radius: 14px; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; &.confirm { background: ${({ theme }) => theme.primary}; color: white; border: none; box-shadow: 0 10px 20px ${({ theme }) => theme.primary}44; &:hover { transform: translateY(-2px); box-shadow: 0 12px 25px ${({ theme }) => theme.primary}66; } &:disabled { opacity: 0.5; transform: none; box-shadow: none; } } &.secondary { background: ${({ theme }) => theme.softBg}; color: ${({ theme }) => theme.text}; border: 1px solid ${({ theme }) => theme.borderColor}; &:hover { background: ${({ theme }) => theme.borderColor}44; } } `;
const ReporteContainer = styled.div` 
    text-align: left; 
    font-family: 'Courier New', Courier, monospace;
    padding: 0; 
    font-size: 11px;
    width: 100%;
    .row { display: flex; justify-content: space-between; margin: 5px 0; } 
    hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
    h3 { font-size: 14px; margin-bottom: 5px; }
    h4 { font-size: 12px; margin: 10px 0 5px; text-decoration: underline; }
`;
