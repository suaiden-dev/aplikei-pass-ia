import { Navigate, Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPathForRole } from "../services/auth.service";

export function AuthLayout() {
  const { user, isAuthenticated } = useAuth();

  // Já autenticado → redireciona para o painel correto
  if (isAuthenticated && user) {
    const target = getDashboardPathForRole(user.role);
    return <Navigate to={target} replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg text-text">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
