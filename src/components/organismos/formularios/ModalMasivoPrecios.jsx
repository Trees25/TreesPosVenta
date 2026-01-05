
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText } from "./InputText";
import { Btn1 } from "../../moleculas/Btn1";
import { useProductosStore } from "../../../store/ProductosStore";
import { ContainerSelector } from "../../atomos/ContainerSelector";
import { useClientesProveedoresStore } from "../../../store/ClientesProveedoresStore";
import { SelectList } from "../../ui/lists/SelectList";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BtnClose } from "../../ui/buttons/BtnClose";
import Swal from "sweetalert2";

export function ModalMasivoPrecios({ onClose }) {
    const queryClient = useQueryClient();
    const { actualizarPreciosMasivo } = useProductosStore();
    const { dataempresa } = useEmpresaStore();
    const { mostrarCliPro, dataclipro, selectCliPro, cliproItemSelect } = useClientesProveedoresStore();
    const [porcentaje, setPorcentaje] = useState(0);
    const [tipoCambio, setTipoCambio] = useState("VENTA");

    useQuery({
        queryKey: ["mostrar proveedores masivo", { id_empresa: dataempresa?.id }],
        queryFn: () => mostrarCliPro({ id_empresa: dataempresa?.id, tipo: "proveedor" }),
        enabled: !!dataempresa,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: `Se actualizarán los precios de venta en un ${porcentaje}% para ${cliproItemSelect ? "el proveedor " + cliproItemSelect.nombres : "TODOS los productos"}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, actualizar",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await actualizarPreciosMasivo({
                        _id_empresa: dataempresa.id,
                        _porcentaje: parseFloat(porcentaje),
                        _id_proveedor: cliproItemSelect?.id || null,
                        _tipo_cambio: tipoCambio
                    });
                    await queryClient.invalidateQueries({ queryKey: ["mostrar productos"] });
                    Swal.fire("Actualizado!", "Los precios han sido actualizados.", "success");
                    onClose();
                } catch (error) {
                    Swal.fire("Error", error.message, "error");
                }
            }
        });
    };

    return (
        <Container>
            <div className="sub-contenedor">
                <div className="headers">
                    <section>
                        <h1>Actualización Masiva de Precios</h1>
                    </section>
                    <section>
                        <BtnClose funcion={onClose} />
                    </section>
                </div>

                <form className="formulario" onSubmit={handleSubmit(onSubmit)}>
                    <section className="seccion1">
                        <article>
                            <InputText icono={<v.iconoflechaderecha />}>
                                <input
                                    step="0.01"
                                    className="form__field"
                                    type="number"
                                    placeholder="Porcentaje de aumento (%)"
                                    {...register("porcentaje", { required: true })}
                                    onChange={(e) => setPorcentaje(e.target.value)}
                                />
                                <label className="form__label">Porcentaje % (Positivo: Aumenta, Negativo: Descuenta)</label>
                                {errors.porcentaje && <p>Campo requerido</p>}
                            </InputText>
                        </article>

                        <ContainerSelector>
                            <label>Proveedor (Opcional): </label>
                            <SelectList
                                data={dataclipro}
                                itemSelect={cliproItemSelect}
                                onSelect={selectCliPro}
                                displayField="nombres"
                            />
                            <span style={{ fontSize: "12px", color: "#888" }}>Si no seleccionas ninguno, se aplicará a todos los productos.</span>
                        </ContainerSelector>

                        <ContainerSelector>
                            <label>Tipo de Actualización: </label>
                            <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <input
                                        type="radio"
                                        id="venta"
                                        name="tipoCambio"
                                        value="VENTA"
                                        checked={tipoCambio === "VENTA"}
                                        onChange={() => setTipoCambio("VENTA")}
                                    />
                                    <label htmlFor="venta">Solo Precio Venta</label>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <input
                                        type="radio"
                                        id="compra"
                                        name="tipoCambio"
                                        value="COMPRA"
                                        checked={tipoCambio === "COMPRA"}
                                        onChange={() => setTipoCambio("COMPRA")}
                                    />
                                    <label htmlFor="compra">Precio Compra + Venta (Mantiene Margen)</label>
                                </div>
                            </div>
                        </ContainerSelector>
                    </section>

                    <Btn1
                        icono={<v.iconoguardar />}
                        titulo="Actualizar Precios"
                        bgcolor="#F9D70B"
                    />
                </form>
            </div>
        </Container>
    );
}

const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);

  .sub-contenedor {
    position: relative;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 13px 36px;
    z-index: 100;
    width: 500px;
    border-radius: 8px;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 24px;
      }
    }
    .formulario {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }
`;
