import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabase.config";
import {
  MostrarUsuarios,
  InsertarEmpresa,
  InsertarAdmin,
  MostrarTipoDocumentos,
  MostrarRolesXnombre,
} from "../index";
import Swal from "sweetalert2";

const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState([]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session == null) {
        setUser(null);

      } else {
        setUser(session?.user);

        insertarDatos(session?.user.id, session?.user.email);
      }
    });
    return () => {
      data.subscription;
    };
  }, []);
  const insertarDatos = async (id_auth, correo) => {
    const response = await MostrarUsuarios({ id_auth: id_auth });
    if (response) {
      return;
    } else {
      try {
        await InsertarEmpresa({ id_auth: id_auth, correo: correo, id_plan: null });
      } catch (error) {
        // Ignoramos si ya existe (duplicate key) para evitar crash
        console.log("Aviso: La empresa ya existía o hubo error al crear:", error.message);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
export const UserAuth = () => {
  return useContext(AuthContext);
};
