import styled from "styled-components";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import { useThemeStore } from "../../../store/ThemeStore";
import { useMostrarVentasXMetodoPagoQuery } from "../../../tanstack/ReportesStack";
import { Device } from "../../../styles/breakpoints";

export const ChartVentasMetodoPago = () => {
  const { data, isLoading } = useMostrarVentasXMetodoPagoQuery();
  const { dataempresa } = useEmpresaStore();
  const { themeStyle } = useThemeStore();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (isLoading) return <LoadingContainer>Cargando medios de pago...</LoadingContainer>;
  if (!data || data.length === 0) return <EmptyContainer>No hay datos de ventas por medio de pago para este periodo</EmptyContainer>;

  return (
    <Container>
      <Header>
        <Title>Ventas por Medio de Pago</Title>
      </Header>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="80%"
            fill="#8884d8"
            dataKey="total_monto"
            nameKey="nombre_metodopago"
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "10px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Container>
  );
};

const CustomTooltip = ({ active, payload }) => {
  const { dataempresa } = useEmpresaStore();
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <Label>{payload[0].name}</Label>
        <Value>
          {FormatearNumeroDinero(
            payload[0].value,
            dataempresa?.currency,
            dataempresa?.iso
          )}
        </Value>
      </TooltipContainer>
    );
  }
  return null;
};

const Container = styled.div`
  padding: 15px;
  min-height: 400px;
  height: 400px;
  display: flex;
  flex-direction: column;
  @media ${Device.tablet} {
    padding: 20px;
    height: 450px;
  }
`;

const LoadingContainer = styled.div`
  padding: 50px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const EmptyContainer = styled.div`
  padding: 50px;
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  opacity: 0.6;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;

const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.bg};
  padding: 10px;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxshadow};
`;

const Label = styled.div`
  font-size: 14px;
`;

const Value = styled.div`
  font-size: 16px;
  font-weight: bold;
`;
