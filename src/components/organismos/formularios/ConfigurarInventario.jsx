import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText } from "../../ui/inputs/InputText";
import { Btn1 } from "../../moleculas/Btn1";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BtnClose } from "../../ui/buttons/BtnClose";

export function ConfigurarInventario({ onClose }) {
    const { dataempresa, editarEmpresa } = useEmpresaStore();
    const queryClient = useQueryClient();

    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm();

    const { isPending, mutate: doEditar } = useMutation({
        mutationFn: editar,
        mutationKey: "editar configuracion inventario",
        onError: (error) => toast.error(`Error: ${error.message}`),
        onSuccess: () => {
            toast.success("Configuración guardada correctamente");
            queryClient.invalidateQueries(["mostrar alertas stock"]);
            onClose();
        },
    });

    async function editar(data) {
        const p = {
            id: dataempresa.id,
            dias_alerta_vencimiento: parseInt(data.dias_alerta_vencimiento),
        };
        await editarEmpresa(p);
    }

    const handlesub = (data) => {
        doEditar(data);
    };

    return (
        <Container>
            <div className="sub-contenedor">
                <div className="headers">
                    <section>
                        <h1>Configuración de Alertas</h1>
                    </section>
                    <section>
                        <BtnClose funcion={onClose} />
                    </section>
                </div>

                <form className="formulario" onSubmit={handleSubmit(handlesub)}>
                    <section className="seccion1">
                        <article>
                            <label>Días de anticipación para alerta de vencimiento:</label>
                            <InputText icono={<v.iconoflechaderecha />}>
                                <input
                                    className="form__field"
                                    defaultValue={dataempresa?.dias_alerta_vencimiento || 7}
                                    type="number"
                                    min="1"
                                    placeholder="Ej: 7"
                                    {...register("dias_alerta_vencimiento", {
                                        required: true,
                                        min: 1
                                    })}
                                />
                                <label className="form__label">Días</label>
                                {errors.dias_alerta_vencimiento?.type === "required" && <p>Campo requerido</p>}
                            </InputText>
                        </article>
                    </section>

                    <Btn1
                        icono={<v.iconoguardar />}
                        titulo="Guardar Configuración"
                        bgcolor="#F9D70B"
                        disabled={isPending}
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
    width: 90%;
    max-width: 500px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 20px;
    border-radius: 8px;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 24px;
        font-weight: 600;
      }
    }

    .formulario {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .seccion1 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          label {
              font-weight: 500;
          }
      }
    }
  }
`;
