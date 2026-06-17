import { useLayoutEffect } from "react";
import { useTheme } from "./useTheme";

export function useForceLightTheme() {
  const { theme, setTheme } = useTheme();

  useLayoutEffect(() => {
    if (theme !== "light") {
      setTheme("light");
    }
  }, [setTheme, theme]);
}
