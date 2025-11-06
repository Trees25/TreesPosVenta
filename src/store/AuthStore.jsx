import { create } from "zustand";
import { supabase, MostrarUsuarios, ObtenerIdAuthSupabase } from "../index";
import { useQueryClient } from "@tanstack/react-query";
import {VerificarOCrearSuscripcionInicial } from "../tanstack/SuscripcionesStack"

export const useAuthStore = create((set) => ({
  loginGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  },
  cerrarSesion: async () => {
    await supabase.auth.signOut();
  },
  
  loginEmail: async (p) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: p.email,
      password: p.password,
    });
    if (error) {
      if (error.status === 400) {
        throw new Error("Correo o contraseña incorrectos");
      } else {
        throw new Error("Error al iniciar sesión: " + error.message);
      }
    }
    return data.user
  },
  crearUserYLogin:async(p)=>{
    const { data, error } = await supabase.auth.signUp({
      email: p.email,
      password: p.password,
      
    })
    return data.user
  },
  // obtenerIdAuthSupabase: async () => {
  //     const response = await ObtenerIdAuthSupabase();
  //     return response;
  //   },

}));

export const useSubcription = create ((set) => {
  //Inicia el estado
  const store = {
    user:null,
    setUser:(user) => set ({ user }),
  };

  //Listener que se ejecuta una vez cuando se importa el store
  supabase.auth.getSession().then(({data: { session } }) =>{
    if(session?.user) {
      VerificarOCrearSuscripcionInicial({id_auth:session.user.id, email:session.user.email})
      set({ user: session.user })
    }
  });

supabase.auth.onAuthStateChange((_event, session) => {
  if(session?.user) {
    VerificarOCrearSuscripcionInicial({id_auth:session.user.id, email:session.user.email})
    set({ user: session.user });
  } else {
    set({ user: null });
  }
});

  return store;
});
