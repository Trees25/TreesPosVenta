import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { useThemeStore } from "./store/ThemeStore";
import { AppRoutes } from "./routers/routes";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { supabase } from "./supabase";
import { useAuthStore } from "./store/AuthStore";
import { UsuarioService } from "./services/UsuarioService";

function App() {
    const { themeStyle } = useThemeStore();
    const { setSession, setUser, setProfile, setProfileError, signOut } = useAuthStore();

    useEffect(() => {
        const fetchProfile = async (userId, retries = 3) => {
            if (!userId) {
                setProfile(null);
                return;
            }
            try {
                const profileData = await UsuarioService.getCurrentUser(userId);

                // Si el perfil es Admin (id_rol 1 o 'admin') y falta la empresa, reintentamos (Race condition post-registro)
                const isMissingEmpresa = profileData && !profileData.empresa && (profileData.id_rol === 1 || profileData.roles?.nombre === 'admin');

                if ((!profileData || isMissingEmpresa) && retries > 0) {
                    console.log(`Perfil o empresa no encontrados, reintentando... (${retries} restantes)`);
                    setTimeout(() => fetchProfile(userId, retries - 1), 1500);
                    return;
                }

                // --- MECANISMO DE AUTOSANACIÓN (Para sesiones huérfanas post-saneamiento) ---
                if (!profileData && retries === 0) {
                    console.log("Intentando autosanación de perfil...");
                    const { data: repaired } = await supabase.rpc("reparar_perfil_usuario", { p_auth_id: userId });

                    if (repaired) {
                        const retryData = await UsuarioService.getCurrentUser(userId);
                        if (retryData) {
                            setProfile(retryData);
                            return;
                        }
                    }

                    // Si llegamos aquí, la sesión está rota sin remedio: AUTO-LIMPIEZA
                    console.warn("Sesión huérfana detectada y no reparable. Ejecutando auto-limpieza...");
                    setProfileError(true);
                    setTimeout(() => signOut(), 3000);
                }

                setProfile(profileData);
            } catch (error) {
                console.error("Error cargando perfil:", error);
                setProfileError(true);
            }
        };

        // Escuchar cambios de autenticación
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            const user = session?.user ?? null;
            setUser(user);
            fetchProfile(user?.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            const user = session?.user ?? null;
            setUser(user);
            if (user) fetchProfile(user.id);
        });

        return () => subscription.unsubscribe();
    }, [setSession, setUser, setProfile, signOut, setProfileError]);

    return (
        <ThemeProvider theme={themeStyle}>
            <GlobalStyles />
            <Toaster position="top-right" richColors />
            <AppRoutes />
        </ThemeProvider>
    );
}

export default App;
