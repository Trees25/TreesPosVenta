import styled from "styled-components";
import { useState } from "react";
import { ProductoService } from "../services/ProductoService";
import { toast } from "sonner";
import Swal from "sweetalert2";

export const MassiveUpdateModal = ({ isOpen, onClose, categorias, proveedores, idEmpresa, onUpdate }) => {
    const [filterBy, setFilterBy] = useState("categoria"); // "categoria" o "proveedor"
    const [selectedId, setSelectedId] = useState("");
    const [valor, setValor] = useState(0);
    const [tipoPrecio, setTipoPrecio] = useState("venta");
    const [modo, setModo] = useState("porcentaje"); // "porcentaje" o "monto"
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!selectedId) {
            toast.warning(`Por favor selecciona ${filterBy === 'categoria' ? 'una categoría' : 'un proveedor'}`);
            return;
        }

        if (parseFloat(valor) === 0) {
            toast.warning("El valor no puede ser 0");
            return;
        }

        const unit = modo === 'porcentaje' ? '%' : ' (monto fijo)';
        const filterName = filterBy === 'categoria'
            ? categorias.find(c => c.id == selectedId)?.nombre
            : proveedores.find(p => p.id == selectedId)?.nombres;

        const result = await Swal.fire({
            title: "¿Confirmar actualización masiva?",
            text: `Se aplicará un cambio de ${valor}${unit} a los precios de ${tipoPrecio === 'ambos' ? 'venta y compra' : tipoPrecio} para los productos de [${filterBy}: ${filterName}].`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff6a00",
            confirmButtonText: "Sí, actualizar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const count = await ProductoService.actualizarPreciosMasivo({
                    id_empresa: idEmpresa,
                    id_categoria: filterBy === 'categoria' ? selectedId : null,
                    id_proveedor: filterBy === 'proveedor' ? selectedId : null,
                    valor: parseFloat(valor),
                    tipo_precio: tipoPrecio,
                    modo: modo
                });

                if (count > 0) {
                    toast.success(`Se actualizaron ${count} productos correctamente.`);
                    if (onUpdate) onUpdate();
                    onClose();
                } else {
                    toast.warning("No se encontraron productos que coincidan con los filtros seleccionados.");
                }
            } catch (error) {
                console.error("Error en actualización masiva:", error);
                toast.error("Error al actualizar productos: " + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <Modal className="glass wide">
                <Header>
                    <h2>⚡ Actualización Masiva</h2>
                    <p>Aplica cambios de precios por porcentaje o monto fijo eligiendo una categoría o proveedor.</p>
                </Header>

                <FormGrid>
                    <InputGroup style={{ gridColumn: 'span 2' }}>
                        <label>Seleccionar Filtro Principal</label>
                        <FilterToggleContainer>
                            <FilterOption
                                $active={filterBy === 'categoria'}
                                onClick={() => { setFilterBy('categoria'); setSelectedId(""); }}
                            >
                                📦 Por Categoría
                            </FilterOption>
                            <FilterOption
                                $active={filterBy === 'proveedor'}
                                onClick={() => { setFilterBy('proveedor'); setSelectedId(""); }}
                            >
                                🤝 Por Proveedor
                            </FilterOption>
                        </FilterToggleContainer>
                    </InputGroup>

                    <InputGroup style={{ gridColumn: 'span 2' }}>
                        <label>{filterBy === 'categoria' ? 'Seleccionar Categoría' : 'Seleccionar Proveedor'}</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="">{filterBy === 'categoria' ? '-- Seleccione Categoría --' : '-- Seleccione Proveedor --'}</option>
                            {filterBy === 'categoria'
                                ? categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)
                                : proveedores.map(p => <option key={p.id} value={p.id}>{p.nombres}</option>)
                            }
                        </select>
                    </InputGroup>

                    <InputGroup>
                        <label>Modo de Actualización</label>
                        <select
                            value={modo}
                            onChange={(e) => setModo(e.target.value)}
                        >
                            <option value="porcentaje">Porcentaje (%)</option>
                            <option value="monto">Monto Fijo ($)</option>
                        </select>
                    </InputGroup>

                    <InputGroup>
                        <label>Precio a Modificar</label>
                        <select
                            value={tipoPrecio}
                            onChange={(e) => setTipoPrecio(e.target.value)}
                        >
                            <option value="venta">Precio de Venta</option>
                            <option value="compra">Precio de Costo (Compra)</option>
                            <option value="ambos">Ambos (Venta y Costo)</option>
                        </select>
                    </InputGroup>

                    <InputGroup style={{ gridColumn: 'span 2' }}>
                        <label>{modo === 'porcentaje' ? 'Porcentaje de Cambio (%)' : 'Monto a Sumar/Restar ($)'}</label>
                        <div className="input-with-badge">
                            <input
                                type="number"
                                step="0.01"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                placeholder={modo === 'porcentaje' ? "Ej: 10 o -5" : "Ej: 500 o -100"}
                            />
                            <ValueBadge $positive={parseFloat(valor) >= 0} $isPercent={modo === 'porcentaje'}>
                                {parseFloat(valor) >= 0 ? "+" : ""}{valor}{modo === 'porcentaje' ? "%" : "$"}
                            </ValueBadge>
                        </div>
                        <small>{parseFloat(valor) >= 0 ? "Incremento" : "Descuento"} de precio.</small>
                    </InputGroup>
                </FormGrid>

                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 106, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 106, 0, 0.1)' }}>
                    <p style={{ fontSize: '13px', color: '#ff6a00', margin: 0, fontWeight: 600 }}>
                        ⚠️ Esta acción modificará los precios de todos los productos de la {filterBy} seleccionada. No se puede revertir automáticamente.
                    </p>
                </div>

                <ModalActions>
                    <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button
                        type="button"
                        className="primary"
                        onClick={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : "Aplicar Actualización"}
                    </button>
                </ModalActions>
            </Modal>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
`;

const Modal = styled.div`
    background: ${({ theme }) => theme.cardBg};
    padding: 30px;
    border-radius: 24px;
    width: 100%;
    max-width: 600px;
    border: 1px solid ${({ theme }) => theme.borderColor}44;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
`;

const Header = styled.div`
    margin-bottom: 25px;
    h2 { margin: 0; font-size: 22px; font-weight: 900; color: ${({ theme }) => theme.text}; }
    p { margin: 5px 0 0; color: ${({ theme }) => theme.text}88; font-size: 13px; }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    label { font-size: 12px; font-weight: 700; color: ${({ theme }) => theme.text}bb; }
    input, select {
        background: ${({ theme }) => theme.softBg};
        border: 1px solid ${({ theme }) => theme.borderColor}44;
        padding: 10px 12px;
        border-radius: 10px;
        color: ${({ theme }) => theme.text};
        font-size: 14px;
        font-weight: 600;
        &:focus { outline: none; border-color: ${({ theme }) => theme.primary}; }
    }
    small { font-size: 11px; color: ${({ theme }) => theme.text}66; }
    .input-with-badge {
        position: relative;
        display: flex;
        align-items: center;
        input { width: 100%; padding-right: 80px; }
    }
`;

const FilterToggleContainer = styled.div`
    display: flex;
    gap: 10px;
    background: ${({ theme }) => theme.softBg};
    padding: 5px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.borderColor}22;
`;

const FilterOption = styled.div`
    flex: 1;
    text-align: center;
    padding: 8px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    background: ${({ $active, theme }) => $active ? theme.primary : 'transparent'};
    color: ${({ $active }) => $active ? 'white' : 'inherit'};
    opacity: ${({ $active }) => $active ? 1 : 0.6};
    
    &:hover {
        opacity: 1;
        background: ${({ $active, theme }) => $active ? theme.primary : theme.borderColor + '22'};
    }
`;

const ValueBadge = styled.span`
    position: absolute;
    right: 10px;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
    background: ${({ $positive }) => $positive ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 71, 87, 0.15)'};
    color: ${({ $positive }) => $positive ? '#2ed573' : '#ff4757'};
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 25px;
    button {
        padding: 10px 20px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid ${({ theme }) => theme.borderColor}44;
        background: ${({ theme }) => theme.softBg};
        color: ${({ theme }) => theme.text};
        &:hover:not(:disabled) { transform: translateY(-1px); border-color: ${({ theme }) => theme.primary}44; }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &.primary {
            background: ${({ theme }) => theme.primary};
            color: white;
            border: none;
            box-shadow: 0 8px 16px ${({ theme }) => theme.primary}33;
            &:hover:not(:disabled) { box-shadow: 0 12px 24px ${({ theme }) => theme.primary}55; }
        }
    }
`;
