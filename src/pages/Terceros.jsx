import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/AuthStore";
import { TercerosService } from "../services/TercerosService";
import { EmpresaService } from "../services/EmpresaService";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export const Terceros = ({ tipo = 'cliente' }) => {
    const { user, profile } = useAuthStore();
    const [data, setData] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);

    const titulo = tipo === 'cliente' ? 'Clientes 👥' : 'Proveedores 🚚';

    useEffect(() => {
        if (user && profile) fetchData();
    }, [user, profile, tipo]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const empresaId = profile?.empresa?.id;
            if (empresaId) {
                const results = await TercerosService.getTerceros(empresaId, tipo);
                setData(results);
            }
        } catch (error) {
            toast.error("Error al cargar " + tipo + "s");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nuevo ' + (tipo === 'cliente' ? 'Cliente' : 'Proveedor'),
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Nombre completo">' +
                '<input id="swal-input2" class="swal2-input" placeholder="Documento">' +
                '<input id="swal-input3" class="swal2-input" placeholder="Teléfono">',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value,
                    document.getElementById('swal-input3').value
                ]
            }
        });

        if (formValues && formValues[0]) {
            try {
                await TercerosService.insertTercero({
                    nombres: formValues[0],
                    numero_documento: formValues[1],
                    telefono: formValues[2],
                    id_empresa: profile.empresa.id,
                    tipo: tipo
                });
                toast.success(tipo + " agregado");
                fetchData();
            } catch (error) {
                console.error("Error al registrar:", error);
                toast.error("Error al registrar: " + error.message);
            }
        }
    };

    const handleEdit = async (item) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar ' + (tipo === 'cliente' ? 'Cliente' : 'Proveedor'),
            html:
                `<input id="swal-input1" class="swal2-input" placeholder="Nombre completo" value="${item.nombres}">` +
                `<input id="swal-input2" class="swal2-input" placeholder="Documento" value="${item.numero_documento || ''}">` +
                `<input id="swal-input3" class="swal2-input" placeholder="Teléfono" value="${item.telefono || ''}">`,
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value,
                    document.getElementById('swal-input3').value
                ]
            }
        });

        if (formValues && formValues[0]) {
            try {
                await TercerosService.updateTercero(item.id, {
                    nombres: formValues[0],
                    numero_documento: formValues[1],
                    telefono: formValues[2]
                });
                toast.success("Actualizado correctamente");
                fetchData();
            } catch (error) {
                console.error("Error al actualizar:", error);
                toast.error("Error al actualizar: " + error.message);
            }
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Vas a eliminar a ${item.nombres}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6a00',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await TercerosService.deleteTercero(item.id);
                toast.success("Eliminado correctamente");
                fetchData();
            } catch (error) {
                console.error("Error al eliminar:", error);
                toast.error("Error al eliminar: " + error.message);
            }
        }
    };

    if (loading) return <Loading>Cargando...</Loading>;

    return (
        <Container>
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HomeBtn to="/">🏠</HomeBtn>
                    <h1>{titulo}</h1>
                </div>
                <button className="add-btn" onClick={handleAdd}>+ Nuevo {tipo === 'cliente' ? 'Cliente' : 'Proveedor'}</button>
            </header>

            <TableContainer className="glass animate-up">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Documento</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id}>
                                <td>{item.nombres}</td>
                                <td>{item.numero_documento}</td>
                                <td>{item.telefono}</td>
                                <td>
                                    <Actions>
                                        <button onClick={() => handleEdit(item)}>✏️</button>
                                        <button className="del" onClick={() => handleDelete(item)}>🗑️</button>
                                    </Actions>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && <EmptyState>No hay registros aún.</EmptyState>}
            </TableContainer>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 5%;
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        .add-btn {
            background: ${({ theme }) => theme.primary};
            color: white;
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 700;
        }
    }
`;

const HomeBtn = styled(Link)`
    background: ${({ theme }) => theme.softBg};
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.borderColor}44;
    text-decoration: none;
    font-size: 20px;
    transition: all 0.2s;
    &:hover {
        background: ${({ theme }) => theme.primary}22;
        border-color: ${({ theme }) => theme.primary};
        transform: scale(1.05);
    }
`;

const TableContainer = styled.div`
    background: ${({ theme }) => theme.cardBg};
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.borderColor};
    table {
        width: 100%;
        border-collapse: collapse;
        th { text-align: left; padding: 20px; background: ${({ theme }) => theme.softBg}; font-size: 14px; text-transform: uppercase; color: ${({ theme }) => theme.primary}; }
        td { padding: 18px 20px; border-bottom: 1px solid ${({ theme }) => theme.borderColor}; font-size: 15px; }
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;
    button {
        padding: 6px;
        border-radius: 6px;
        background: ${({ theme }) => theme.softBg};
        &.del:hover { background: #ff5e5722; }
    }
`;

const EmptyState = styled.div` padding: 40px; text-align: center; color: ${({ theme }) => theme.text}88; `;
const Loading = styled.div` height: 80vh; display: flex; align-items: center; justify-content: center; font-weight: 700; `;
