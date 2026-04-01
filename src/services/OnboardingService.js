import { supabase } from "../supabase";
import { SucursalService } from "./SucursalService";
import { AlmacenService } from "./AlmacenService";
import { MetodoPagoService } from "./MetodoPagoService";

export const OnboardingService = {
    initializeInfrastructure: async (idAuthUser, nombreNegocio) => {
        try {
            // 1. Obtener los IDs de empresa y perfil recién creados
            const { data: perfil, error: perfilError } = await supabase
                .from("usuarios")
                .select("id, id_empresa")
                .eq("id_auth", idAuthUser)
                .single();

            if (perfilError || !perfil?.id_empresa) {
                console.error("Error al obtener perfil para onboarding:", perfilError);
                throw new Error("No se pudo confirmar tu perfil de empresa. Por favor, recarga la página.");
            }

            const idEmpresa = perfil.id_empresa;
            const idUsuario = perfil.id;

            // 2. Crear Sucursal Principal ("Sede Central")
            const sucursal = await SucursalService.insertSucursal({
                nombre: "Sede Central",
                id_empresa: idEmpresa,
                direccion: "Dirección General"
            });

            if (!sucursal) throw new Error("Fallo al crear la sucursal principal.");

            // 3. Crear Almacén Principal vinculado a la sucursal
            await AlmacenService.insertAlmacen({
                nombre: "Almacén Principal",
                id_empresa: idEmpresa,
                id_sucursal: sucursal.id
            });

            // 4. Crear Caja Principal vinculado a la sucursal
            // Directamente a la tabla 'caja'
            await supabase.from("caja").insert({
                nombre: "Caja 1",
                id_empresa: idEmpresa,
                id_sucursal: sucursal.id
            });

            // 5. Activar Métodos de Pago básicos (Efectivo)
            await MetodoPagoService.activarMetodo(idEmpresa, {
                nombre: 'Efectivo',
                icono: 'mdi:cash'
            });

            // 6. Actualizar el perfil del usuario para que esté vinculado a la nueva sucursal
            await supabase.from("usuarios")
                .update({ id_sucursal: sucursal.id })
                .eq("id", idUsuario);

            return true;
        } catch (error) {
            console.error("Critical error during infrastructure initialization:", error);
            throw error;
        }
    }
};
