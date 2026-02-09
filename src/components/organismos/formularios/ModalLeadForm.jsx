import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "../../../index";
import { Btn1 } from "../../moleculas/Btn1";
import { InputText } from "./InputText";
import { BtnClose } from "../../ui/buttons/BtnClose";
import { Device } from "../../../styles/breakpoints";
import { Icon } from "@iconify/react";

export function ModalLeadForm({ onClose }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { mutate, isPending } = useMutation({
        mutationKey: ["insertar lead"],
        mutationFn: async (data) => {
            const { error } = await supabase.from("leads").insert(data);
            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            toast.success("¡Gracias! Pronto nos pondremos en contacto contigo.");
            onClose();
        },
        onError: (error) => {
            toast.error("Error al enviar: " + error.message);
        },
    });

    const onSubmit = (data) => {
        mutate(data);
    };

    return (
        <Overlay>
            <Container>
                <Header>
                    <TitleArea>
                        <Icon icon="solar:rocket-bold-duotone" width="40" />
                        <div>
                            <h3>Crea tu propia empresa</h3>
                            <p>Déjanos tus datos y un asesor te ayudará a configurar tu sistema personalizado.</p>
                        </div>
                    </TitleArea>
                    <BtnClose funcion={onClose} />
                </Header>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Grid>
                        <article>
                            <InputText
                                icono={<Icon icon="solar:user-bold" />}
                            >
                                <input
                                    className="form__field"
                                    placeholder=" "
                                    {...register("nombre_dueno", { required: "Campo requerido" })}
                                />
                                <label className="form__label">Tu Nombre</label>
                            </InputText>
                            {errors.nombre_dueno && <ErrorText>{errors.nombre_dueno.message}</ErrorText>}
                        </article>

                        <article>
                            <InputText
                                icono={<Icon icon="solar:shop-bold" />}
                            >
                                <input
                                    className="form__field"
                                    placeholder=" "
                                    {...register("nombre_negocio", { required: "Campo requerido" })}
                                />
                                <label className="form__label">Nombre del Negocio</label>
                            </InputText>
                            {errors.nombre_negocio && <ErrorText>{errors.nombre_negocio.message}</ErrorText>}
                        </article>

                        <article>
                            <InputText
                                icono={<Icon icon="solar:hamburger-menu-bold" />}
                            >
                                <select
                                    className="form__field"
                                    style={{ appearance: 'none' }}
                                    {...register("rubro", { required: "Selecciona un rubro" })}
                                >
                                    <option value="">Selecciona rubro...</option>
                                    <option value="Mini Market">Mini Market / Almacén</option>
                                    <option value="Indumentaria">Indumentaria</option>
                                    <option value="Ferreteria">Ferretería</option>
                                    <option value="Restaurante">Restaurante / Bar</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                <label className="form__label">Rubro</label>
                            </InputText>
                            {errors.rubro && <ErrorText>{errors.rubro.message}</ErrorText>}
                        </article>

                        <article>
                            <InputText
                                icono={<Icon icon="solar:whatsapp-bold" />}
                            >
                                <input
                                    className="form__field"
                                    placeholder=" "
                                    type="tel"
                                    {...register("whatsapp", { required: "Campo requerido" })}
                                />
                                <label className="form__label">WhatsApp</label>
                            </InputText>
                            {errors.whatsapp && <ErrorText>{errors.whatsapp.message}</ErrorText>}
                        </article>
                    </Grid>

                    <FooterBtn>
                        <Btn1
                            titulo={isPending ? "Enviando..." : "SOLICITAR MI EMPRESA GRATIS"}
                            bgcolor="#1cb0f6"
                            color="#fff"
                            width="100%"
                            disabled={isPending}
                        />
                        <small>Al enviar aceptas que un asesor se comunique contigo.</small>
                    </FooterBtn>
                </Form>
            </Container>
        </Overlay>
    );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
`;

const Container = styled.div`
  background: ${({ theme }) => theme.body};
  width: 100%;
  max-width: 550px;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  position: relative;
  border: 1px solid ${({ theme }) => theme.bg4};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
`;

const TitleArea = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  color: #1cb0f6;
  h3 {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    color: ${({ theme }) => theme.text};
  }
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colorSubtitle};
    margin: 5px 0 0 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  @media ${Device.tablet} {
    grid-template-columns: 1fr 1fr;
  }
`;

const FooterBtn = styled.div`
  margin-top: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  small {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;

const ErrorText = styled.span`
  color: #fb3b3b;
  font-size: 0.75rem;
  margin-top: 5px;
  display: block;
`;
