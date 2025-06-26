import { useContext } from "react";
import { ThemeProviderContext } from "./theme-context";

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  
  return context;
}; 