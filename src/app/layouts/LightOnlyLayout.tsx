import { Outlet } from "react-router-dom";
import { useForceLightTheme } from "@shared/hooks/useForceLightTheme";

export function LightOnlyLayout() {
  useForceLightTheme();

  return <Outlet />;
}
