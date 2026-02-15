import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LightTheme, DarkTheme } from "../styles/theme";

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: "dark",
            themeStyle: DarkTheme,
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === "light" ? "dark" : "light",
                    themeStyle: state.theme === "light" ? DarkTheme : LightTheme,
                })),
            setTheme: (theme) =>
                set({
                    theme,
                    themeStyle: theme === "light" ? LightTheme : DarkTheme,
                }),
        }),
        {
            name: "theme-storage",
        }
    )
);
