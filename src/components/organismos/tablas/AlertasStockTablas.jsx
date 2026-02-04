import styled from "styled-components";
import { v } from "../../../styles/variables";

export function AlertasStockTablas({ data }) {
    if (!data || data.length === 0) return null;

    // Filtrar datos
    const vencimientos = data.filter((item) => item.estado.includes("VENCI"));
    const stockBajo = data.filter((item) => !item.estado.includes("VENCI"));

    return (
        <Container>
            {stockBajo.length > 0 && (
                <TableSection>
                    <h3>⚠️ Stock Bajo</h3>
                    <TableWrapper>
                        <StyledTable $tipo="bajo">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Almacén</th>
                                    <th>Stock Actual</th>
                                    <th>Stock Min.</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockBajo.map((item, index) => (
                                    <tr key={index}>
                                        <td data-title="Producto">{item.nombre}</td>
                                        <td data-title="Almacén">{item.almacen}</td>
                                        <td data-title="Stock Actual">{item.stock}</td>
                                        <td data-title="Stock Min.">{item.stock_minimo}</td>
                                        <td data-title="Estado">
                                            <Badge $tipo="bajo">{item.estado}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </StyledTable>
                    </TableWrapper>
                </TableSection>
            )}

            {vencimientos.length > 0 && (
                <TableSection>
                    <h3>📅 Vencimientos Próximos</h3>
                    <TableWrapper>
                        <StyledTable $tipo="vencimiento">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Almacén</th>
                                    <th>Fecha Venc.</th>
                                    <th>Días Restantes</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vencimientos.map((item, index) => (
                                    <tr key={index}>
                                        <td data-title="Producto">{item.nombre}</td>
                                        <td data-title="Almacén">{item.almacen}</td>
                                        <td data-title="Fecha Venc.">{item.fecha_vencimiento}</td>
                                        <td data-title="Días Restantes">{item.dias_para_vencer}</td>
                                        <td data-title="Estado">
                                            <Badge $tipo={item.estado === "VENCIDO" ? "vencido" : "por_vencer"}>
                                                {item.estado}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </StyledTable>
                    </TableWrapper>
                </TableSection>
            )}
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const TableSection = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.bg};
  border-radius: 10px;
  padding: 15px;
  box-shadow: ${({ theme }) => theme.boxshadow};
  
  h3 {
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.text};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.border || "#e5e7eb"};
    color: ${({ theme }) => theme.text};

    @media (max-width: 768px) {
        display: block;
        text-align: right;
        padding-left: 50%;
        position: relative;
        &:before {
            content: attr(data-title);
            position: absolute;
            left: 10px;
            width: 45%;
            padding-right: 10px;
            white-space: nowrap;
            text-align: left;
            font-weight: bold;
        }
    }
  }

  thead {
      @media (max-width: 768px) {
          display: none;
      }
  }

  tr {
      @media (max-width: 768px) {
          display: block;
          border: 1px solid ${({ theme }) => theme.border || "#e5e7eb"};
          margin-bottom: 15px;
          border-radius: 8px;
          overflow: hidden;
      }
  }

  th {
    font-weight: 600;
    background-color: ${({ theme }) => theme.bg2 || "rgba(0,0,0,0.05)"};
    white-space: nowrap;
  }

  /* Color del borde superior o indicador según tipo */
  border-top: 4px solid ${({ $tipo }) =>
        $tipo === "bajo" ? "#eab308" : "#f97316"}; 
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  white-space: nowrap;
  
  background-color: ${({ $tipo }) =>
        $tipo === "vencido" ? "rgba(239, 68, 68, 0.1)" :
            $tipo === "por_vencer" ? "rgba(249, 115, 22, 0.1)" :
                "rgba(234, 179, 8, 0.1)"};

  color: ${({ $tipo }) =>
        $tipo === "vencido" ? "#ef4444" :
            $tipo === "por_vencer" ? "#f97316" :
                "#eab308"};
    
  border: 1px solid ${({ $tipo }) =>
        $tipo === "vencido" ? "#ef4444" :
            $tipo === "por_vencer" ? "#f97316" :
                "#eab308"};
`;
