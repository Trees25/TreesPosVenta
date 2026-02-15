import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { useThemeStore } from "./store/ThemeStore";
import { AppRoutes } from "./routers/routes";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { supabase } from "./supabase";
import { useAuthStore } from "./store/AuthStore";

function App() {
    const { themeStyle } = useThemeStore();
    const { setSession, setUser } = useAuthStore();

    useEffect(() => {
        // Escuchar cambios de autenticación
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [setSession, setUser]);

    return (
        <ThemeProvider theme={themeStyle}>
            <GlobalStyles />
            <Toaster position="top-right" richColors />
            <AppRoutes />
        </ThemeProvider>
    );
}

export default App;
