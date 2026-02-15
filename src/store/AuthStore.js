import { create } from "zustand";
import { supabase } from "../supabase";

export const useAuthStore = create((set) => ({
    user: null,
    session: null,
    loading: true,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, loading: false }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },
    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    }
}));
