import styled from "styled-components";
import { useState, useEffect } from "react";
import { ProductoService } from "../services/ProductoService";
import { VentaService } from "../services/VentaService";
import { CajaService } from "../services/CajaService";
import { useAuthStore } from "../store/AuthStore";
import { useVentaStore } from "../store/VentaStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../supabase";
import { ModalCobro } from "../components/ModalCobro";

export const POS = () => {
    const { user } = useAuthStore();
    const {
        carrito, agregarProducto, quitarProducto, actualizarCantidad,
        getTotal, limpiarCarrito, idCaja, setCaja
    } = useVentaStore();

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("");
    const [showCobro, setShowCobro] = useState(false);
    const [empresa, setEmpresa] = useState(null);
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        if (user) checkCajaAndFetch();
    }, [user]);

    const checkCajaAndFetch = async () => {
        try {
            setLoading(true);
            const [{ data: uDatas }, { data: eDatas }] = await Promise.all([
                supabase.from("usuarios").select("id, id_empresa").eq("id_auth", user.id).limit(2),
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
            const empId = eData?.id || usuarioData?.id_empresa;
            setEmpresa(eData || { id: empId });

            let cajaAbierta = await CajaService.obtenerCajaAbierta(usuarioData.id);
            if (!cajaAbierta) {
                // Obtener una caja física disponible con limit(1) para evitar error de mulitple rows
                const { data: cajas } = await supabase.from("caja").select("id").limit(1);
                const bData = cajas?.[0];

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
                    id_caja: bData?.id || 1,
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

    const filteredProducts = productos.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        p.codigo_interno?.includes(filtro)
    );

    if (loading) return <LoadingContainer>Cargando POS...</LoadingContainer>;

    return (
        <POSContainer>
            <ProductsSection className="animate-fade">
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
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
