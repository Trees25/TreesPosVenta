import styled from "styled-components";
import { useState, useEffect } from "react";
import { useVentaStore } from "../store/VentaStore";
import { VentaService } from "../services/VentaService";
import { supabase } from "../supabase";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

export const ModalCobro = ({ onVentaExitosa, onClose, idEmpresa, idUsuario, idCaja, idAlmacen }) => {
    const { getTotal, getNeto, getDescuentoCalculado, descuentoValor, descuentoTipo, setDescuento, cliente, setCliente, carrito, limpiarCarrito } = useVentaStore();

    const [metodosPago, setMetodosPago] = useState([]);
    const [pagos, setPagos] = useState({});
    const [loading, setLoading] = useState(false);
    const [busquedaCliente, setBusquedaCliente] = useState("");
    const [clientesEncontrados, setClientesEncontrados] = useState([]);

    useEffect(() => {
        fetchMetodosPago();
    }, []);

    const fetchMetodosPago = async () => {
        const { data } = await supabase.from("metodos_pago").select("*").eq("id_empresa", idEmpresa);
        if (data) {
            setMetodosPago(data);
            // Por defecto, poner todo en el primer método (usualmente Efectivo)
            if (data.length > 0) {
                setPagos({ [data[0].id]: getTotal() });
            }
        }
    };

    const handleBuscarCliente = async (val) => {
        setBusquedaCliente(val);
        if (val.length > 2) {
            const { data } = await supabase
                .from("clientes_proveedores")
                .select("*")
                .eq("tipo", "cliente")
                .eq("id_empresa", idEmpresa)
                .ilike("nombres", `%${val}%`)
                .limit(5);
            setClientesEncontrados(data || []);
        } else {
            setClientesEncontrados([]);
        }
    };

    const handlePagoChange = (id, monto) => {
        setPagos(prev => ({ ...prev, [id]: parseFloat(monto) || 0 }));
    };

    const totalPagado = Object.values(pagos).reduce((acc, curr) => acc + curr, 0);
    const vuelto = Math.max(0, totalPagado - getTotal());
    const falta = Math.max(0, getTotal() - totalPagado);

    const handleConfirmar = async () => {
        if (totalPagado < getTotal()) return toast.error("El monto pagado es insuficiente");

        setLoading(true);
        try {
            const ventaData = {
                venta: {
                    total: getTotal(),
                    neto: getNeto(),
                    descuento: getDescuentoCalculado(),
                    tipo_descuento: descuentoTipo,
                    id_usuario: idUsuario,
                    id_cliente: cliente?.id || null,
                    id_caja: idCaja,
                    id_empresa: idEmpresa,
                    id_almacen: idAlmacen,
                    tipo_pago: Object.keys(pagos).length > 1 ? "mixto" : metodosPago.find(m => m.id == Object.keys(pagos)[0])?.nombre.toLowerCase()
                },
                detalles: carrito.map(item => ({
                    id_producto: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_venta,
                    subtotal: item.total
                })),
                pagos: Object.entries(pagos)
                    .filter(([_, monto]) => monto > 0)
                    .map(([id, monto]) => ({
                        id_metodo_pago: id,
                        monto: monto,
                        nombre_metodo: metodosPago.find(m => m.id == id)?.nombre,
                        vuelto: metodosPago.find(m => m.id == id)?.nombre === "Efectivo" ? vuelto : 0
                    }))
            };

            await VentaService.procesarVenta(ventaData);
            toast.success("Venta finalizada correctamente");
            limpiarCarrito();
            onVentaExitosa();
        } catch (error) {
            toast.error("Error al procesar venta: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Overlay className="animate-fade">
            <ModalContainer className="glass premium-shadow animate-scale">
                <Header>
                    <h2>Finalizar Venta</h2>
                    <button className="close" onClick={onClose}><Icon icon="mdi:close" /></button>
                </Header>

                <Content>
                    <Section>
                        <Label><Icon icon="mdi:account" /> Cliente</Label>
                        <SearchBox>
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={cliente ? cliente.nombres : busquedaCliente}
                                onChange={(e) => handleBuscarCliente(e.target.value)}
                                disabled={!!cliente}
                            />
                            {cliente && <button onClick={() => setCliente(null)}><Icon icon="mdi:close-circle" /></button>}
                            {!cliente && clientesEncontrados.length > 0 && (
                                <Dropdown>
                                    {clientesEncontrados.map(c => (
                                        <div key={c.id} onClick={() => { setCliente(c); setClientesEncontrados([]); }}>
                                            {c.nombres} ({c.numero_documento})
                                        </div>
                                    ))}
                                </Dropdown>
                            )}
                        </SearchBox>
                    </Section>

                    <Section>
                        <Label><Icon icon="mdi:tag-outline" /> Descuento</Label>
                        <DiscountGroup>
                            <input
                                type="number"
                                value={descuentoValor}
                                onChange={(e) => setDescuento(e.target.value, descuentoTipo)}
                                placeholder="0.00"
                            />
                            <div className="toggles">
                                <button className={descuentoTipo === "monto" ? "active" : ""} onClick={() => setDescuento(descuentoValor, "monto")}>$</button>
                                <button className={descuentoTipo === "porcentaje" ? "active" : ""} onClick={() => setDescuento(descuentoValor, "porcentaje")}>%</button>
                            </div>
                        </DiscountGroup>
                    </Section>

                    <Section>
                        <Label><Icon icon="mdi:cash-multiple" /> Medios de Pago</Label>
                        <PaymentsGrid>
                            {metodosPago.map(m => (
                                <PaymentItem key={m.id}>
                                    <span>{m.icono ? <Icon icon={m.icono} /> : <Icon icon="mdi:payment" />} {m.nombre}</span>
                                    <input
                                        type="number"
                                        value={pagos[m.id] || ""}
                                        onChange={(e) => handlePagoChange(m.id, e.target.value)}
                                        placeholder="0.00"
                                    />
                                </PaymentItem>
                            ))}
                        </PaymentsGrid>
                    </Section>

                    <Summary>
                        <div className="row">
                            <span>Subtotal:</span>
                            <span>${getNeto()}</span>
                        </div>
                        <div className="row highlight">
                            <span>Descuento:</span>
                            <span>-${getDescuentoCalculado()}</span>
                        </div>
                        <div className="row total">
                            <span>Total a Cobrar:</span>
                            <span>${getTotal()}</span>
                        </div>
                        <div className="row footer">
                            <article>
                                <span className="label">Recibido:</span>
                                <span className="val">${totalPagado}</span>
                            </article>
                            <article>
                                {vuelto > 0 ? (
                                    <>
                                        <span className="label text-success">Vuelto:</span>
                                        <span className="val text-success">${vuelto}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="label text-danger">Falta:</span>
                                        <span className="val text-danger">${falta}</span>
                                    </>
                                )}
                            </article>
                        </div>
                    </Summary>
                </Content>

                <Footer>
                    <button className="confirm" onClick={handleConfirmar} disabled={loading || totalPagado < getTotal()}>
                        {loading ? "Procesando..." : "Confirmar Pago (Enter)"}
                    </button>
                </Footer>
            </ModalContainer>
        </Overlay>
    );
};

const Overlay = styled.div` position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); `;
const ModalContainer = styled.div` background: ${({ theme }) => theme.cardBg}; width: 100%; max-width: 500px; border-radius: 20px; border: 1px solid ${({ theme }) => theme.borderColor}55; padding: 25px; display: flex; flex-direction: column; gap: 20px; `;
const Header = styled.div` display: flex; justify-content: space-between; align-items: center; h2 { margin: 0; font-size: 20px; font-weight: 800; } .close { background: none; border: none; font-size: 24px; cursor: pointer; color: ${({ theme }) => theme.text}88; } `;
const Content = styled.div` display: flex; flex-direction: column; gap: 20px; `;
const Section = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Label = styled.label` font-size: 13px; font-weight: 700; color: ${({ theme }) => theme.text}88; display: flex; align-items: center; gap: 5px; `;
const SearchBox = styled.div` position: relative; input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid ${({ theme }) => theme.borderColor}; background: ${({ theme }) => theme.softBg}; color: ${({ theme }) => theme.text}; } button { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 18px; color: ${({ theme }) => theme.text}44; } `;
const Dropdown = styled.div` position: absolute; top: 100%; left: 0; right: 0; background: ${({ theme }) => theme.cardBg}; border: 1px solid ${({ theme }) => theme.borderColor}; border-radius: 0 0 10px 10px; z-index: 10; box-shadow: 0 10px 20px rgba(0,0,0,0.1); div { padding: 10px 15px; cursor: pointer; &:hover { background: ${({ theme }) => theme.softBg}; } } `;
const DiscountGroup = styled.div` display: flex; gap: 10px; input { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid ${({ theme }) => theme.borderColor}; background: ${({ theme }) => theme.softBg}; color: ${({ theme }) => theme.text}; } .toggles { display: flex; background: ${({ theme }) => theme.softBg}; padding: 4px; border-radius: 10px; button { padding: 8px 15px; border-radius: 8px; border: none; background: transparent; cursor: pointer; color: ${({ theme }) => theme.text}88; font-weight: 700; &.active { background: ${({ theme }) => theme.primary}; color: white; } } } `;
const PaymentsGrid = styled.div` display: grid; grid-template-columns: 1fr; gap: 10px; `;
const PaymentItem = styled.div` display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: ${({ theme }) => theme.softBg}; border-radius: 12px; span { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; } input { width: 120px; text-align: right; background: transparent; border: none; font-weight: 800; font-size: 18px; color: ${({ theme }) => theme.primary}; &:focus { outline: none; } } `;
const Summary = styled.div` background: ${({ theme }) => theme.softBg}; border-radius: 15px; padding: 20px; display: flex; flex-direction: column; gap: 8px; .row { display: flex; justify-content: space-between; font-weight: 600; font-size: 15px; &.highlight { color: ${({ theme }) => theme.danger}; } &.total { border-top: 1px dashed ${({ theme }) => theme.borderColor}; margin-top: 5px; padding-top: 5px; font-size: 22px; font-weight: 900; color: ${({ theme }) => theme.primary}; } &.footer { border-top: 1px solid ${({ theme }) => theme.borderColor}55; margin-top: 10px; padding-top: 15px; display: grid; grid-template-columns: 1fr 1fr; article { display: flex; flex-direction: column; .label { font-size: 11px; font-weight: 700; opacity: 0.6; } .val { font-size: 20px; font-weight: 800; } .text-success { color: #2ecc71; } .text-danger { color: #e74c3c; } } } } `;
const Footer = styled.div` .confirm { width: 100%; padding: 18px; border-radius: 15px; background: ${({ theme }) => theme.primary}; color: white; font-weight: 800; font-size: 18px; box-shadow: 0 10px 20px ${({ theme }) => theme.primary}44; cursor: pointer; &:disabled { opacity: 0.5; box-shadow: none; cursor: not-allowed; } } `;
