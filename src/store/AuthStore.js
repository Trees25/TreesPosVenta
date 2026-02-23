import { create } from "zustand";
import { supabase } from "../supabase";

export const useAuthStore = create((set) => ({
    user: null,
    profile: null,
    session: null,
    loading: true,
    profileError: false, // Nuevo estado para sesiones huérfanas
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile, profileError: false }),
    setProfileError: (val) => set({ profileError: val }),
    setSession: (session) => set({ session, loading: false }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null, session: null, profileError: false });
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
