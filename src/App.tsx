import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/organisms/ScrollToTop";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { MasterDashboardLayout } from "./layouts/MasterDashboardLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { SellerDashboardLayout } from "./layouts/SellerDashboardLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { routesByLayout } from "./routes/appRoutes";
import type { UserRole } from "./features/auth/types";

function nestedPath(fullPath: string, basePath: string) {
  if (fullPath === basePath) return "";
  return fullPath.replace(`${basePath}/`, "");
}

function appendToBase(basePath: string, sharedPath: string) {
  const clean = sharedPath.startsWith("/") ? sharedPath.slice(1) : sharedPath;
  return `${basePath}/${clean}`;
}

function routeHasSidebarRole(
  route: { sidebarLayouts?: UserRole[] },
  roles: UserRole[],
) {
  return route.sidebarLayouts?.some((role) => roles.includes(role)) ?? false;
}

function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  const publicRoutes = routesByLayout("public");
  const authRoutes = routesByLayout("auth");
  const standaloneRoutes = routesByLayout("standalone");
  const protectedRoutes = routesByLayout("protected");
  const customerRoutes = routesByLayout("customer");
  const masterRoutes = routesByLayout("master");
  const adminRoutes = routesByLayout("manager");
  const adminActiveRoutes = adminRoutes.filter((route) => route.path === "/admin" || route.path === "/admin/page-builder");
  const sellerActiveRoutes: typeof adminRoutes = [];
  const adminSharedRoutes = protectedRoutes.filter((route) =>
    routeHasSidebarRole(route, ["master", "manager", "admin_lawyer"]),
  );
  const masterSharedRoutes = protectedRoutes.filter((route) =>
    routeHasSidebarRole(route, ["master"]),
  );
  const sellerSharedRoutes = protectedRoutes.filter((route) =>
    routeHasSidebarRole(route, ["seller"]),
  );

  const protectedStandaloneRoutes = standaloneRoutes.filter((route) => route.authRequired);
  const unprotectedStandaloneRoutes = standaloneRoutes.filter((route) => !route.authRequired);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            {publicRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Route>

          <Route element={<AuthLayout />}>
            {authRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Route>

          {unprotectedStandaloneRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}

          <Route element={<ProtectedRoute />}>
            {protectedStandaloneRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
            <Route element={<CustomerLayout />}>
              {customerRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={<route.component />} />
              ))}
            </Route>

            <Route path="/master" element={<MasterDashboardLayout />}>
              {masterRoutes.map((route) =>
                route.path === "/master" ? (
                  <Route key={route.path} index element={<route.component />} />
                ) : (
                  <Route key={route.path} path={nestedPath(route.path, "/master")} element={<route.component />} />
                ),
              )}
              {masterSharedRoutes.map((route) => (
                <Route
                  key={`master-shared-${route.path}`}
                  element={<RoleRoute allowedRoles={(route.sidebarLayouts as UserRole[] | undefined) ?? []} />}
                >
                  <Route
                    path={nestedPath(appendToBase("/master", route.path), "/master")}
                    element={<route.component />}
                  />
                </Route>
              ))}
            </Route>

            <Route element={<AdminDashboardLayout />}>
              {adminActiveRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={<route.component />} />
              ))}
              {adminSharedRoutes.map((route) => (
                <Route
                  key={`admin-${route.path}`}
                  element={<RoleRoute allowedRoles={(route.sidebarLayouts as UserRole[] | undefined) ?? []} />}
                >
                  <Route
                    path={route.path}
                    element={<route.component />}
                  />
                </Route>
              ))}
            </Route>

            <Route path="/seller" element={<SellerDashboardLayout />}>
              {sellerActiveRoutes.map((route) => (
                <Route key={route.path} path={nestedPath(route.path, "/seller")} element={<route.component />} />
              ))}
              {sellerSharedRoutes.map((route) => (
                <Route
                  key={`seller-shared-${route.path}`}
                  element={<RoleRoute allowedRoles={(route.sidebarLayouts as UserRole[] | undefined) ?? []} />}
                >
                  <Route
                    path={nestedPath(appendToBase("/seller", route.path), "/seller")}
                    element={<route.component />}
                  />
                </Route>
              ))}
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg text-text">
                <h1 className="text-6xl font-black text-primary">404</h1>
                <p className="text-text-muted">Página não encontrada</p>
                <a href="/" className="text-primary underline">
                  Voltar ao início
                </a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
