import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { getDashboardPathForRole } from "@features/auth/services/authService";
import { Navbar } from "@shared/components/organisms/PublicNavbar";

export function AuthLayout() {
  const { user, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const hideNavbar =
    pathname === "/track-my-case" || pathname === "/track-my-visa";

  // Já autenticado → redireciona para o painel correto
  if (isAuthenticated && user) {
    const target = getDashboardPathForRole(user.role);
    return <Navigate to={target} replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg text-text">
      {!hideNavbar && <Navbar />}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
