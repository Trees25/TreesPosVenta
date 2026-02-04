import React, { useState } from "react";
import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { BtnClose } from "../../ui/buttons/BtnClose";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { InputText2 } from "../formularios/InputText2";
import { slideBackground } from "../../../styles/keyframes";

export const ModalDescuento = ({ onClose }) => {
    const { aplicarDescuento } = useDetalleVentasStore();
    const [valor, setValor] = useState(0);
    const [tipo, setTipo] = useState("monto"); // "monto" | "porcentaje"

    const handleAplicar = () => {
        aplicarDescuento(parseFloat(valor), tipo);
        onClose();
    };

    return (
        <Container>
            <SubContainer>
                <BtnClose funcion={onClose} />
                <Header>
                    <Title>Aplicar Descuento</Title>
                </Header>

                <Content>
                    <ToggleContainer>
                        <ToggleButton
                            $active={tipo === "monto"}
                            onClick={() => setTipo("monto")}
                        >
                            $ Monto Fijo
                        </ToggleButton>
                        <ToggleButton
                            $active={tipo === "porcentaje"}
                            onClick={() => setTipo("porcentaje")}
                        >
                            % Porcentaje
                        </ToggleButton>
                    </ToggleContainer>

                    <InputContainer>
                        <InputText2>
                            <input
                                type="number"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                placeholder="Ingrese valor..."
                                className="form__field"
                                min="0"
                            />
                        </InputText2>
                    </InputContainer>

                    <Actions>
                        <Btn1
                            bgcolor="#f5f5f5"
                            color="#000"
                            titulo="Cancelar"
                            funcion={onClose}
                        />
                        <Btn1
                            bgcolor="#207c33"
                            color="#fff"
                            titulo="Aplicar"
                            funcion={handleAplicar}
                        />
                    </Actions>
                </Content>
            </SubContainer>
        </Container>
    );
};

const Container = styled.div`
  background-color: rgba(18, 18, 18, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const SubContainer = styled.div`
  background-color: ${({ theme }) => theme.bgtotal || "#fff"};
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 10px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ToggleContainer = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.bg || "#f0f0f0"};
  border-radius: 8px;
  padding: 4px;
  gap: 5px;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: ${({ $active, theme }) =>
        $active ? theme.primary || "#207c33" : "transparent"};
  color: ${({ $active }) => ($active ? "#fff" : "inherit")};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $active, theme }) =>
        $active ? theme.primary : "rgba(0,0,0,0.05)"};
  }
`;

const InputContainer = styled.div`
  input {
    font-size: 1.5rem;
    text-align: center;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: space-between;
  > * {
    flex: 1;
  }
`;
