import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/AuthStore";
import { ProductoService } from "../services/ProductoService";
import { StockService } from "../services/StockService";
import { AlmacenService } from "../services/AlmacenService";
import { SucursalService } from "../services/SucursalService";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";

export const AjusteStock = () => {
    const { profile } = useAuthStore();
    const [productos, setProductos] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            tipo: 'entrada',
            cantidad: 1
        }
    });

    const selectedProductId = watch("id_producto");

    useEffect(() => {
        if (profile?.empresa?.id) fetchData();
    }, [profile]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const empresaId = profile.empresa.id;
            const [prodList, almList] = await Promise.all([
                ProductoService.listarProductos(empresaId),
                AlmacenService.getAlmacenesByEmpresa(empresaId)
            ]);
            setProductos(prodList || []);
            const list = almList || [];
            setAlmacenes(list);

            // Si solo hay un almacén, lo seleccionamos por defecto
            if (list.length === 1) {
                setValue("id_almacen", list[0].id);
            }
        } catch (error) {
            toast.error("Error al cargar datos: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await StockService.registrarMovimiento({
                id_producto: parseInt(data.id_producto),
                id_almacen: parseInt(data.id_almacen),
                cantidad: parseFloat(data.cantidad),
                tipo: data.tipo,
                id_usuario: profile.id,
                motivo: data.motivo
            });
            toast.success("Ajuste registrado exitosamente");
            reset({ tipo: 'entrada', cantidad: 1, id_producto: data.id_producto, id_almacen: data.id_almacen });
            fetchData();
        } catch (error) {
            toast.error("Error al registrar ajuste: " + error.message);
        }
    };

    if (loading) return <LoadingState>Preparando inventario...</LoadingState>;

    return (
        <Container>
            <Header className="animate-fade">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <div>
                        <h1>Ajuste de Stock 📦</h1>
                        <p>Registra ingresos y egresos manuales de mercancía</p>
                    </div>
                </div>
                <Link to="/inventario/productos">
                    <SecondaryBtn>Ver Productos</SecondaryBtn>
                </Link>
            </Header>

            <MainGrid>
                <FormCard className="glass animate-up">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <InputGroup>
                            <label>Producto</label>
                            <select {...register("id_producto", { required: true })}>
                                <option value="">Seleccionar producto...</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} ({p.codigo_interno})</option>
                                ))}
                            </select>
                        </InputGroup>

                        <InputGroup>
                            <label>Almacén / Sucursal</label>
                            <select {...register("id_almacen", { required: true })}>
                                <option value="">Seleccionar almacén...</option>
                                {almacenes.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre} ({a.sucursales?.nombre || 'General'})</option>
                                ))}
                            </select>
                        </InputGroup>

                        <TwoCols>
                            <InputGroup>
                                <label>Tipo de Movimiento</label>
                                <select {...register("tipo")}>
                                    <option value="entrada">📥 Ingreso (Aumentar)</option>
                                    <option value="salida">📤 Egreso (Disminuir)</option>
                                </select>
                            </InputGroup>
                            <InputGroup>
                                <label>Cantidad</label>
                                <input type="number" step="0.01" {...register("cantidad", { required: true, min: 0.01 })} />
                            </InputGroup>
                        </TwoCols>

                        <InputGroup>
                            <label>Motivo / Observación</label>
                            <textarea
                                {...register("motivo", { required: true })}
                                placeholder="Ej: Compra a proveedor, Ajuste por rotura, Error de carga..."
                                rows="3"
                            />
                        </InputGroup>

                        <SubmitBtn type="submit">
                            Registrar Movimiento
                        </SubmitBtn>
                    </form>
                </FormCard>

                <HistoryCard className="glass animate-up" style={{ animationDelay: '0.2s' }}>
                    <h3>Estado Actual</h3>
                    {selectedProductId ? (
                        <StockInfo>
                            {productos.find(p => p.id == selectedProductId)?.stock?.map(s => (
                                <StockItem key={s.id}>
                                    <span className="wh">{s.almacen?.nombre}:</span>
                                    <span className="qty">{s.stock} {productos.find(p => p.id == selectedProductId)?.sevende_por === 'GRANEL' ? 'kg' : 'ud'}</span>
                                </StockItem>
                            )) || <p>Sin stock registrado en almacenes.</p>}
                        </StockInfo>
                    ) : (
                        <EmptyHistory>
                            <Icon icon="mdi:package-variant" />
                            <p>Selecciona un producto para ver su stock actual</p>
                        </EmptyHistory>
                    )}
                </HistoryCard>
            </MainGrid>
        </Container>
    );
};

const Container = styled.div` padding: 40px 5%; max-width: 1200px; margin: 0 auto; `;
const LoadingState = styled.div` text-align: center; padding: 100px; color: ${({ theme }) => theme.primary}; font-weight: 800; font-size: 20px; `;

const Header = styled.div`
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;
    h1 { margin: 0; font-size: 28px; font-weight: 900; }
    p { margin: 5px 0 0; color: ${({ theme }) => theme.text}66; font-size: 14px; font-weight: 600; }
`;

const HomeBtn = styled(Link)` background: ${({ theme }) => theme.softBg}; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid ${({ theme }) => theme.borderColor}44; text-decoration: none; font-size: 20px; transition: all 0.2s; &:hover { background: ${({ theme }) => theme.primary}22; border-color: ${({ theme }) => theme.primary}; transform: scale(1.05); } `;
const SecondaryBtn = styled.button` background: ${({ theme }) => theme.softBg}; color: ${({ theme }) => theme.text}; padding: 12px 24px; border-radius: 12px; font-weight: 700; border: 1px solid ${({ theme }) => theme.borderColor}44; cursor: pointer; &:hover { background: ${({ theme }) => theme.primary}11; border-color: ${({ theme }) => theme.primary}; } `;

const MainGrid = styled.div` display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; @media (max-width: 900px) { grid-template-columns: 1fr; } `;

const FormCard = styled.div`
    background: ${({ theme }) => theme.cardBg}; border: 1px solid ${({ theme }) => theme.borderColor}33; padding: 30px; border-radius: 24px;
`;

const HistoryCard = styled.div`
    background: ${({ theme }) => theme.cardBg}; border: 1px solid ${({ theme }) => theme.borderColor}33; padding: 30px; border-radius: 24px;
    h3 { margin-top: 0; margin-bottom: 20px; font-size: 18px; }
`;

const InputGroup = styled.div`
    display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;
    label { font-size: 13px; font-weight: 700; color: ${({ theme }) => theme.text}88; }
    input, select, textarea {
        background: ${({ theme }) => theme.softBg}; border: 1px solid ${({ theme }) => theme.borderColor}66;
        padding: 12px 15px; border-radius: 12px; color: ${({ theme }) => theme.text}; font-weight: 600;
        &:focus { outline: none; border-color: ${({ theme }) => theme.primary}; }
    }
`;

const TwoCols = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 20px; `;

const SubmitBtn = styled.button`
    width: 100%; background: ${({ theme }) => theme.primary}; color: white; padding: 16px; border-radius: 14px;
    border: none; font-weight: 800; cursor: pointer; transition: all 0.2s; margin-top: 10px;
    box-shadow: 0 10px 20px ${({ theme }) => theme.primary}33;
    &:hover { transform: translateY(-2px); box-shadow: 0 15px 30px ${({ theme }) => theme.primary}44; }
`;

const StockInfo = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const StockItem = styled.div`
    display: flex; justify-content: space-between; padding: 15px; background: ${({ theme }) => theme.softBg}44; border-radius: 12px;
    .wh { font-weight: 600; font-size: 14px; }
    .qty { font-weight: 800; color: ${({ theme }) => theme.primary}; font-size: 16px; }
`;

const EmptyHistory = styled.div`
    text-align: center; padding: 40px 20px; color: ${({ theme }) => theme.text}33;
    svg { font-size: 48px; margin-bottom: 10px; }
    p { font-size: 14px; font-weight: 600; }
`;
