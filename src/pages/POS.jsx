import styled from "styled-components";
import { useState, useEffect } from "react";
import { ProductoService } from "../services/ProductoService";
import { VentaService } from "../services/VentaService";
import { CajaService } from "../services/CajaService";
import { useAuthStore } from "../store/AuthStore";
import { useVentaStore } from "../store/VentaStore";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { supabase } from "../supabase";
import { ModalCobro } from "../components/ModalCobro";
import { ModalCierreCaja } from "../components/ModalCierreCaja";
import { OfflineService } from "../services/OfflineService";

export const POS = () => {
    const { user, profile } = useAuthStore();
    const navigate = useNavigate();
    const {
        carrito, agregarProducto, quitarProducto, actualizarCantidad,
        getTotal, limpiarCarrito, idCaja, setCaja
    } = useVentaStore();

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("");
    const [showCobro, setShowCobro] = useState(false);
    const [showCierre, setShowCierre] = useState(false);
    const [empresa, setEmpresa] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [ventasPendientes, setVentasPendientes] = useState([]);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (user) checkCajaAndFetch();
        
        // Listeners de Red
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        
        // Cargar pendientes iniciales
        setVentasPendientes(OfflineService.listarVentasPendientes());

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [user]);

    // Lector de Código de Barras (HID Scanner)
    useEffect(() => {
        let buffer = "";
        let lastKeyTime = Date.now();

        const handleKeyDown = (e) => {
            const currentTime = Date.now();

            // Si el tiempo entre teclas es muy corto (< 50ms), asumimos que es un escáner
            if (currentTime - lastKeyTime > 50) {
                buffer = "";
            }

            lastKeyTime = currentTime;

            if (e.key === "Enter") {
                if (buffer.length > 2) {
                    const product = productos.find(p =>
                        p.codigo_barras === buffer ||
                        p.codigo_interno === buffer
                    );

                    if (product) {
                        agregarProducto(product);
                        setFiltro(""); // Limpiar búsqueda al escanear
                        toast.success(`Scaneado: ${product.nombre}`);
                    } else {
                        toast.error(`Código no encontrado: ${buffer}`);
                    }
                    buffer = "";
                }
            } else if (e.key.length === 1) {
                buffer += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [productos]); // Dependencia de productos para poder buscar

    const checkCajaAndFetch = async () => {
        try {
            setLoading(true);
            const [{ data: uDatas }, { data: eDatas }] = await Promise.all([
                supabase.from("usuarios").select("id, id_empresa, id_sucursal").eq("id_auth", user.id).limit(2),
                supabase.from("empresa").select("id, id_auth_user").eq("id_auth_user", user.id).limit(2)
            ]);

            const usuarioData = uDatas?.[0];
            const eData = eDatas?.[0];

            if (!usuarioData) {
                toast.error("Perfil de usuario no encontrado.");
                setLoading(false);
                return;
            }

            setUsuario(usuarioData);
            
            // LA MAGIA ESTABA AQUÍ: El sistema priorizaba empresas fantasmas autogeneradas (eData.id) 
            // sobre el id_empresa real y legítimo que le delegó el Administrador (usuarioData.id_empresa).
            // 1. Obtener la ID de empresa de la forma más fiable (igual que en MiPerfil.jsx)
            const empId = profile?.id_empresa || profile?.empresa?.id || usuarioData?.id_empresa || eData?.id;
            
            if (!empId) {
                console.error("DEBUG POS: No se pudo determinar empId", { profile, usuarioData, eData });
                toast.error("Error: Tu perfil de empleado no tiene compañía asignada.");
                setLoading(false);
                return;
            }
            
            setEmpresa({ id: empId });

            // 1. Saneamiento: Cerrar cajas huérfanas (>24hs) antes de chequear
            await supabase.rpc("cerrar_cajas_huerfanas", { p_id_usuario: usuarioData.id });

            // 2. Buscar caja abierta actual
            let cajaAbierta = await CajaService.obtenerCajaAbierta(usuarioData.id);

            if (!cajaAbierta) {
                // Obtener una caja física disponible (Priorizamos sucursal del usuario, fallback a cualquier caja de la empresa)
                let queryCaja = supabase.from("caja").select("id").limit(1);
                if (usuarioData.id_sucursal) {
                    queryCaja = queryCaja.eq("id_sucursal", usuarioData.id_sucursal);
                } else {
                    queryCaja = queryCaja.eq("id_empresa", empId);
                }
                
                const { data: cajas } = await queryCaja;
                let cajaId = cajas?.[0]?.id;

                // Si la sucursal no tiene caja física, bloqueamos la entrada educativamente
                if (!cajaId) {
                    throw new Error("El administrador debe abrir primero la Caja Principal de esta Sucursal desde su panel u otorgarte una caja válida.");
                }

                const { value: monto } = await Swal.fire({
                    title: "Apertura de Caja",
                    input: "number",
                    inputLabel: "Monto inicial",
                    inputPlaceholder: "0.00",
                    confirmButtonColor: "#ff6a00",
                    allowOutsideClick: false
                });

                if (monto === undefined) return;

                cajaAbierta = await CajaService.abrirCaja({
                    id_usuario: usuarioData.id,
                    id_caja: cajaId,
                    id_empresa: empId,
                    monto_inicial: parseFloat(monto) || 0
                });
            }
            setCaja(cajaAbierta.id);

            const prodList = await ProductoService.listarProductos(empId);
            setProductos(prodList);
        } catch (error) {
            toast.error("Error al inicializar POS: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCerrarCaja = () => {
        setShowCierre(true);
    };

    const onCierreExitoso = () => {
        limpiarCarrito();
        setCaja(null);
        setShowCierre(false);
        navigate("/", { replace: true });
    };

    const handleFinalizar = () => {
        if (carrito.length === 0) return toast.error("El carrito está vacío");
        setShowCobro(true);
    };

    const onVentaExitosa = async () => {
        setShowCobro(false);
        // Recargar productos para ver stock actualizado
        const prodList = await ProductoService.listarProductos(empresa.id);
        setProductos(prodList);
    };

    const sincronizarVentas = async () => {
        const pendientes = OfflineService.listarVentasPendientes();
        if (pendientes.length === 0) return;

        setSyncing(true);
        let exitosas = 0;
        let errores = 0;

        for (const v of pendientes) {
            try {
                // Forzar intento real pasando por alto el check offline
                await supabase.rpc("finalizar_venta_atomica", {
                    _venta: v.data.venta,
                    _detalles: v.data.detalles,
                    _pagos: v.data.pagos
                });
                OfflineService.eliminarVentaPendiente(v.id_temp);
                exitosas++;
            } catch (error) {
                console.error("Error sincronizando venta local:", error);
                errores++;
            }
        }

        setVentasPendientes(OfflineService.listarVentasPendientes());
        setSyncing(false);

        if (exitosas > 0) toast.success(`Sincronizadas ${exitosas} ventas.`);
        if (errores > 0) toast.error(`${errores} ventas no pudieron sincronizarse.`);
    };

    const filteredProducts = productos.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        p.codigo_interno?.includes(filtro) ||
        p.codigo_barras?.includes(filtro)
    );

    if (loading) return <LoadingContainer>Cargando POS...</LoadingContainer>;

    return (
        <POSContainer>
            <ProductsSection className="animate-fade">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <CerrarCajaBtn onClick={handleCerrarCaja}>
                        <Icon icon="mdi:lock-outline" /> Cerrar Caja
                    </CerrarCajaBtn>
                    
                    {/* Indicador Offline */}
                    <ConnectionBadge $isOnline={isOnline}>
                        <Icon icon={isOnline ? "mdi:wifi" : "mdi:wifi-off"} />
                        {isOnline ? "En Línea" : "Sin Conexión"}
                    </ConnectionBadge>

                    {ventasPendientes.length > 0 && (
                        <SyncBtn onClick={sincronizarVentas} disabled={!isOnline || syncing}>
                            <Icon icon={syncing ? "mdi:loading" : "mdi:sync"} className={syncing ? "animate-spin" : ""} />
                            Sincronizar ({ventasPendientes.length})
                        </SyncBtn>
                    )}

                    <SearchBox style={{ marginBottom: 0, flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o SKU..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </SearchBox>
                </div>
                <ProductsGrid>
                    {filteredProducts.map((p, idx) => (
                        <ProductCard
                            key={p.id}
                            onClick={() => agregarProducto(p)}
                            className="glass animate-scale"
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            <div className="name">{p.nombre}</div>
                            <div className="price">${p.precio_venta}</div>
                            <div className="stock">Stock: {p.stock?.[0]?.stock || 0}</div>
                        </ProductCard>
                    ))}
                </ProductsGrid>
            </ProductsSection>

            <CartSection className="glass premium-shadow animate-up">
                <h2>Carrito de Venta</h2>
                <CartItems>
                    {carrito.length === 0 ? (
                        <EmptyState>Agregue productos para comenzar</EmptyState>
                    ) : (
                        carrito.map(item => (
                            <CartItem key={item.id}>
                                <div className="details">
                                    <div className="name">{item.nombre}</div>
                                    <div className="price">${item.precio_venta} x {item.cantidad}</div>
                                </div>
                                <div className="actions">
                                    <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>-</button>
                                    <span>{item.cantidad}</span>
                                    <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>+</button>
                                    <button className="del" onClick={() => quitarProducto(item.id)}>🗑️</button>
                                </div>
                            </CartItem>
                        ))
                    )}
                </CartItems>
                <CartFooter>
                    <TotalRow>
                        <span>Total a Pagar</span>
                        <span className="amount">${getTotal()}</span>
                    </TotalRow>
                    <PayBtn onClick={handleFinalizar} disabled={carrito.length === 0}>
                        Finalizar Venta
                    </PayBtn>
                </CartFooter>
            </CartSection>

            {showCierre && (
                <ModalCierreCaja
                    idCierre={idCaja}
                    onClose={() => setShowCierre(false)}
                    onCierreExitoso={onCierreExitoso}
                />
            )}

            {showCobro && (
                <ModalCobro
                    onClose={() => setShowCobro(false)}
                    onVentaExitosa={onVentaExitosa}
                    idEmpresa={empresa?.id}
                    idUsuario={usuario?.id}
                    idCaja={idCaja}
                    idAlmacen={productos[0]?.stock?.[0]?.id_almacen}
                />
            )}
        </POSContainer>
    );
};

const POSContainer = styled.div` display: grid; grid-template-columns: 1fr 400px; height: calc(100vh - 80px); gap: 20px; padding: 20px; `;
const HomeBtn = styled(Link)` background: ${({ theme }) => theme.cardBg}; width: 55px; height: 55px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid ${({ theme }) => theme.borderColor}44; text-decoration: none; font-size: 24px; transition: all 0.2s; &:hover { background: ${({ theme }) => theme.primary}22; border-color: ${({ theme }) => theme.primary}; transform: scale(1.05); } `;
const CerrarCajaBtn = styled.button` background: #ff5e5711; color: #ff5e57; border: 1px solid #ff5e5733; padding: 0 20px; height: 55px; border-radius: 12px; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; &:hover { background: #ff5e57; color: white; transform: translateY(-2px); box-shadow: 0 8px 20px #ff5e5744; } `;
const ProductsSection = styled.div` overflow-y: auto; padding-right: 10px; `;
const SearchBox = styled.div` margin-bottom: 20px; input { width: 100%; padding: 15px; border-radius: 12px; border: 1px solid ${({ theme }) => theme.borderColor}; background: ${({ theme }) => theme.cardBg}; color: ${({ theme }) => theme.text}; font-size: 16px; } `;
const ProductsGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; `;
const ProductCard = styled.div` background: ${({ theme }) => theme.cardBg}; padding: 20px; border-radius: 15px; cursor: pointer; transition: all 0.2s; &:hover { transform: translateY(-3px); border-color: ${({ theme }) => theme.primary}; } .name { font-weight: 700; margin-bottom: 5px; } .price { color: ${({ theme }) => theme.primary}; font-weight: 800; font-size: 18px; } .stock { font-size: 12px; color: ${({ theme }) => theme.text}66; margin-top: 5px; } `;
const CartSection = styled.div` display: flex; flex-direction: column; background: ${({ theme }) => theme.cardBg}; border-radius: 20px; border: 1px solid ${({ theme }) => theme.borderColor}; padding: 25px; `;
const CartItems = styled.div` flex: 1; overflow-y: auto; padding: 10px 0; `;
const EmptyState = styled.div` text-align: center; color: ${({ theme }) => theme.text}44; margin-top: 100px; `;
const CartItem = styled.div` display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid ${({ theme }) => theme.borderColor}; .details { .name { font-weight: 600; } .price { font-size: 14px; color: ${({ theme }) => theme.text}88; } } .actions { display: flex; align-items: center; gap: 8px; button { background: ${({ theme }) => theme.softBg}; width: 28px; height: 28px; border-radius: 8px; &.del { background: transparent; color: ${({ theme }) => theme.danger}; } } } `;
const CartFooter = styled.div` margin-top: auto; padding-top: 20px; border-top: 2px solid ${({ theme }) => theme.borderColor}; `;
const TotalRow = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; span { font-size: 18px; font-weight: 600; &.amount { font-size: 32px; font-weight: 900; color: ${({ theme }) => theme.primary}; } } `;
const PayBtn = styled.button` width: 100%; background: ${({ theme }) => theme.primary}; color: white; padding: 18px; border-radius: 15px; font-size: 18px; font-weight: 800; box-shadow: 0 10px 20px ${({ theme }) => theme.primary}44; &:disabled { opacity: 0.5; box-shadow: none; } `;
const LoadingContainer = styled.div` height: calc(100vh - 80px); display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: 800; color: ${({ theme }) => theme.primary}; `;

const ConnectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 800;
    background: ${({ $isOnline }) => $isOnline ? "#2ecc7122" : "#e74c3c22"};
    color: ${({ $isOnline }) => $isOnline ? "#2ecc71" : "#e74c3c"};
    border: 1px solid ${({ $isOnline }) => $isOnline ? "#2ecc7144" : "#e74c3c44"};
`;

const SyncBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 800;
    background: ${({ theme }) => theme.primary};
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 10px ${({ theme }) => theme.primary}44;
    &:disabled { opacity: 0.6; cursor: not-allowed; }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
