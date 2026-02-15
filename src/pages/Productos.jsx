import styled from "styled-components";
import { useState, useEffect } from "react";
import { ProductoService } from "../services/ProductoService";
import { CategoriaService } from "../services/CategoriaService";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { supabase } from "../supabase";

export const Productos = () => {
    const { user } = useAuthStore();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState(null);
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: eDatas, error: eError } = await supabase.from("empresa").select("id").eq("id_auth_user", user.id).limit(1);
            if (eError) throw eError;
            const empresa = eDatas?.[0];

            if (empresa) {
                const [prodList, catList] = await Promise.all([
                    ProductoService.listarProductos(empresa.id),
                    CategoriaService.listarCategorias(empresa.id)
                ]);
                setProductos(prodList || []);
                setCategorias(catList || []);
            }
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const [{ data: eDatas }, { data: uDatas }] = await Promise.all([
                supabase.from("empresa").select("id").eq("id_auth_user", user.id).limit(1),
                supabase.from("usuarios").select("id").eq("id_auth", user.id).limit(1)
            ]);

            const empresa = eDatas?.[0];
            const usuario = uDatas?.[0];

            if (!empresa || !usuario) throw new Error("No se encontró empresa o usuario");

            const payload = {
                ...data,
                id_empresa: empresa.id,
                id_usuario: usuario.id,
                stock_inicial: data.stock_inicial || 0
            };

            if (editingId) {
                await ProductoService.actualizarProducto(editingId, payload);
                toast.success("Producto actualizado exitosamente");
            } else {
                await ProductoService.insertarProducto(payload);
                toast.success("Producto creado exitosamente");
            }

            handleClose();
            fetchData();
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Error al guardar producto");
        }
    };

    const handleEdit = (prod) => {
        setEditingId(prod.id);
        setValue("nombre", prod.nombre);
        setValue("id_categoria", prod.id_categoria);
        setValue("codigo_barras", prod.codigo_barras);
        setValue("codigo_interno", prod.codigo_interno);
        setValue("precio_compra", prod.precio_compra);
        setValue("precio_venta", prod.precio_venta);
        setValue("sevende_por", prod.sevende_por);
        setValue("fecha_vencimiento", prod.fecha_vencimiento);
        setValue("stock_minimo", prod.stock?.[0]?.stock_minimo);
        setValue("dias_alerta", prod.dias_alerta);
        setValue("maneja_inventarios", prod.maneja_inventarios);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "¿Eliminar producto?",
            text: "Esta acción no se puede deshacer y afectará el stock.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff4757",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await ProductoService.eliminarProducto(id);
                toast.success("Producto eliminado");
                fetchData();
            } catch (error) {
                toast.error("Error al eliminar producto");
            }
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        reset();
    };

    const generateInternalCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'SKU-';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setValue("codigo_interno", result);
        toast.info("Código generado: " + result);
    };

    const filteredProductos = productos.filter(p =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo_barras?.includes(searchTerm) ||
        p.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container>
            <Header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <div className="title-area">
                        <h1>Productos e Inventario</h1>
                        <p>{productos.length} artículos registrados</p>
                    </div>
                </div>
                <div className="actions-area">
                    <SearchBox className="glass">
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, barras o SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <AddBtn onClick={() => setShowModal(true)}>+ Nuevo Producto</AddBtn>
                </div>
            </Header>

            <TableContainer className="glass blur">
                <Table>
                    <thead>
                        <tr>
                            <th>Producto / SKU</th>
                            <th>Código Barras</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Vencimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProductos.map((prod) => (
                            <tr key={prod.id} className="animate-fade">
                                <td>
                                    <ProdInfo>
                                        <div className="name">{prod.nombre}</div>
                                        <div className="sku">{prod.codigo_interno || "SC-000"}</div>
                                    </ProdInfo>
                                </td>
                                <td><CodeText>{prod.codigo_barras || "---"}</CodeText></td>
                                <td>{prod.categorias?.nombre || "General"}</td>
                                <td><PriceText>${prod.precio_venta}</PriceText></td>
                                <td>
                                    <StockBadge $low={prod.stock?.[0]?.stock <= prod.stock?.[0]?.stock_minimo}>
                                        {prod.stock?.[0]?.stock || 0} {prod.sevende_por === 'GRANEL' ? 'kg' : 'ud'}
                                    </StockBadge>
                                </td>
                                <td>
                                    {prod.fecha_vencimiento ? (
                                        <ExpiryBadge $days={Math.ceil((new Date(prod.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24))}>
                                            {new Date(prod.fecha_vencimiento).toLocaleDateString()}
                                        </ExpiryBadge>
                                    ) : "---"}
                                </td>
                                <td>
                                    <ActionIcons>
                                        <span onClick={() => handleEdit(prod)}>⚙️</span>
                                        <span onClick={() => handleDelete(prod.id)}>🗑️</span>
                                    </ActionIcons>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </TableContainer>

            {showModal && (
                <ModalOverlay>
                    <Modal className="glass wide">
                        <h2>{editingId ? "Editar" : "Registrar Nuevo"} Producto</h2>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <FormGrid>
                                <InputGroup>
                                    <label>Nombre del Producto</label>
                                    <input {...register("nombre", { required: true })} placeholder="Ej: Coca Cola 2L" />
                                </InputGroup>
                                <InputGroup>
                                    <label>Categoría</label>
                                    <select {...register("id_categoria", { required: true })}>
                                        <option value="">Seleccionar...</option>
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </InputGroup>
                                <InputGroup>
                                    <label>Código de Barras</label>
                                    <input {...register("codigo_barras")} placeholder="Escanea o escribe..." />
                                </InputGroup>
                                <InputGroup>
                                    <label>Código Interno (SKU)</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input {...register("codigo_interno")} placeholder="P-001" style={{ flex: 1 }} />
                                        <button
                                            type="button"
                                            onClick={generateInternalCode}
                                            style={{ padding: '0 12px', background: 'rgba(255,106,0,0.1)', color: '#ff6a00', border: '1px solid #ff6a0022', borderRadius: '8px' }}
                                            title="Generar código"
                                        >
                                            🪄
                                        </button>
                                    </div>
                                </InputGroup>
                                <InputGroup>
                                    <label>Precio Compra</label>
                                    <input type="number" step="0.01" {...register("precio_compra")} />
                                </InputGroup>
                                <InputGroup>
                                    <label>Precio Venta</label>
                                    <input type="number" step="0.01" {...register("precio_venta", { required: true })} />
                                </InputGroup>
                                <InputGroup>
                                    <label>Se vende por:</label>
                                    <select {...register("sevende_por")}>
                                        <option value="UNIDAD">Unidad</option>
                                        <option value="GRANEL">Granel (Kg/Lt)</option>
                                    </select>
                                </InputGroup>
                                <InputGroup>
                                    <label>Fecha de Vencimiento</label>
                                    <input type="date" {...register("fecha_vencimiento")} />
                                </InputGroup>
                                <InputGroup>
                                    <label>Stock Inicial</label>
                                    <input type="number" {...register("stock_inicial")} />
                                </InputGroup>
                                <InputGroup>
                                    <label>Stock Mínimo</label>
                                    <input type="number" {...register("stock_minimo")} />
                                </InputGroup>
                                <InputGroup>
                                    <label>Aviso Vencimiento (Días)</label>
                                    <input type="number" {...register("dias_alerta")} defaultValue={7} />
                                </InputGroup>
                                <InputGroup style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" {...register("maneja_inventarios")} defaultChecked />
                                    <label style={{ margin: 0 }}>Maneja Inventarios</label>
                                </InputGroup>
                            </FormGrid>
                            <ModalActions>
                                <button type="button" onClick={handleClose}>Cancelar</button>
                                <button type="submit" className="primary">Crear Producto</button>
                            </ModalActions>
                        </form>
                    </Modal>
                </ModalOverlay>
            )}
        </Container>
    );
};

// ... Estilos avanzados (Container, Header, Table, Modal, etc.)
const Container = styled.div` padding: 40px 5%; `;
const HomeBtn = styled(Link)` background: ${({ theme }) => theme.softBg}; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid ${({ theme }) => theme.borderColor}44; text-decoration: none; font-size: 20px; transition: all 0.2s; &:hover { background: ${({ theme }) => theme.primary}22; border-color: ${({ theme }) => theme.primary}; transform: scale(1.05); } `;
const Header = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; gap: 20px; @media (max-width: 768px) { flex-direction: column; align-items: flex-start; } .title-area { h1 { margin: 0; font-size: 28px; font-weight: 900; } p { margin: 5px 0 0; color: ${({ theme }) => theme.text}66; font-size: 14px; font-weight: 600; } } .actions-area { display: flex; gap: 15px; flex: 1; justify-content: flex-end; width: 100%; } `;
const SearchBox = styled.div` display: flex; align-items: center; gap: 12px; padding: 0 20px; background: ${({ theme }) => theme.softBg}; border: 1px solid ${({ theme }) => theme.borderColor}44; border-radius: 16px; flex: 1; max-width: 500px; height: 50px; span { font-size: 18px; filter: grayscale(1); } input { background: transparent; border: none; color: ${({ theme }) => theme.text}; font-size: 14px; width: 100%; font-weight: 600; &:focus { outline: none; } &::placeholder { color: ${({ theme }) => theme.text}44; } } `;
const AddBtn = styled.button` background: ${({ theme }) => theme.primary}; color: white; padding: 0 30px; border-radius: 16px; font-weight: 800; font-size: 14px; height: 50px; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 20px ${({ theme }) => theme.primary}33; &:hover { transform: translateY(-2px); box-shadow: 0 15px 30px ${({ theme }) => theme.primary}55; } `;
const TableContainer = styled.div` background: ${({ theme }) => theme.cardBg}; border: 1px solid ${({ theme }) => theme.borderColor}33; border-radius: 24px; overflow: hidden; &.blur { backdrop-filter: blur(20px); } `;
const Table = styled.table` width: 100%; border-collapse: collapse; th { text-align: left; padding: 22px 25px; background: ${({ theme }) => theme.softBg}44; font-size: 12px; color: ${({ theme }) => theme.text}66; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; } td { padding: 22px 25px; border-bottom: 1px solid ${({ theme }) => theme.borderColor}11; } tr.animate-fade { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `;
const ProdInfo = styled.div` .name { font-weight: 700; color: ${({ theme }) => theme.text}; } .sku { font-size: 11px; color: ${({ theme }) => theme.primary}; font-family: monospace; font-weight: 700; text-transform: uppercase; } `;
const CodeText = styled.div` font-size: 11px; color: ${({ theme }) => theme.text}88; font-family: 'Libre Barcode 39', cursive, monospace; `;
const PriceText = styled.div` font-weight: 800; color: ${({ theme }) => theme.primary}; fontSize: 16px; `;
const StockBadge = styled.span` background: ${({ $low, theme }) => $low ? "#ff475722" : "#2ed57322"}; color: ${({ $low, theme }) => $low ? "#ff4757" : "#2ed573"}; padding: 6px 12px; border-radius: 20px; font-weight: 800; font-size: 12px; border: 1px solid ${({ $low, theme }) => $low ? "#ff475744" : "#2ed57344"}; `;
const ExpiryBadge = styled.span` background: ${({ $days }) => $days < 0 ? "#ff475722" : $days < 7 ? "#ffa50222" : "#2ed57311"}; color: ${({ $days }) => $days < 0 ? "#ff4757" : $days < 7 ? "#ffa502" : "#2ed57388"}; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 11px; `;
const ActionIcons = styled.div` font-size: 18px; cursor: pointer; display: flex; gap: 10px; `;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; `;
const Modal = styled.div` background: ${({ theme }) => theme.cardBg}; padding: 40px; border-radius: 24px; width: 100%; max-width: 600px; border: 1px solid ${({ theme }) => theme.borderColor}; &.wide { max-width: 800px; } h2 { margin-bottom: 30px; } `;
const FormGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 20px; `;
const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; label { font-size: 13px; font-weight: 600; } input, select { background: ${({ theme }) => theme.softBg}; border: 1px solid ${({ theme }) => theme.borderColor}; padding: 12px; border-radius: 8px; color: ${({ theme }) => theme.text}; } `;
const ModalActions = styled.div` display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; button { padding: 12px 24px; border-radius: 12px; font-weight: 600; &.primary { background: ${({ theme }) => theme.primary}; color: white; } } `;
