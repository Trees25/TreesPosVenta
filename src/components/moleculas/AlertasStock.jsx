import styled from "styled-components";
import { v } from "../../styles/variables";

export function AlertasStock({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <Container>
            <h3>⚠️ Alertas de Inventario</h3>
            <AlertGrid>
                {data.map((item, index) => (
                    <Card key={index} $tipo={item.estado}>
                        <div className="header">
                            <span className="badge">{item.estado}</span>
                            <span className="product-name">{item.nombre}</span>
                        </div>
                        <div className="details">
                            {item.estado.includes("VENCI") ? (
                                <span>Vence: {item.fecha_vencimiento} ({item.dias_para_vencer} días)</span>
                            ) : (
                                <span>Stock: {item.stock} / Min: {item.stock_minimo}</span>
                            )}
                            <span className="almacen">📍 {item.almacen}</span>
                        </div>
                    </Card>
                ))}
            </AlertGrid>
        </Container>
    );
}

const Container = styled.div`
  margin-bottom: 20px;
  h3 {
    margin-bottom: 10px;
    color: ${({ theme }) => theme.text};
    font-size: 1.2rem;
  }
`;

const AlertGrid = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
  
  &::-webkit-scrollbar {
    height: 6px;
    background-color: #333;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 5px;
  }
`;

const Card = styled.div`
  min-width: 200px;
  background-color: ${({ theme }) => theme.bg};
  border: 1px solid ${({ $tipo }) =>
        $tipo === 'VENCIDO' ? '#ef4444' :
            $tipo === 'POR VENCER' ? '#f97316' :
                '#eab308'}; 
  border-left: 5px solid ${({ $tipo }) =>
        $tipo === 'VENCIDO' ? '#ef4444' :
            $tipo === 'POR VENCER' ? '#f97316' :
                '#eab308'};
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);

  .header {
    display: flex;
    flex-direction: column;
    gap: 5px;
    
    .badge {
      font-size: 0.7rem;
      font-weight: bold;
      color: ${({ $tipo }) =>
        $tipo === 'VENCIDO' ? '#ef4444' :
            $tipo === 'POR VENCER' ? '#f97316' :
                '#eab308'};
      text-transform: uppercase;
    }
    .product-name {
      font-weight: 600;
      color: ${({ theme }) => theme.text};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
  }

  .details {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.text};
    opacity: 0.8;
    display: flex;
    flex-direction: column;
  }
  
  .almacen {
      font-size: 0.7rem;
      margin-top: 2px;
  }
`;
