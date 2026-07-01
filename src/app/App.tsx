import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ScrollToTop } from "@shared/components/organisms/ScrollToTop";
import { AdminDashboardLayout } from "@app/app/layouts/AdminDashboardLayout";
import { AuthLayout } from "@app/app/layouts/AuthLayout";
import { CustomerLayout } from "@app/app/layouts/CustomerLayout";
import { LightOnlyLayout } from "@app/app/layouts/LightOnlyLayout";
import { MasterDashboardLayout } from "@app/app/layouts/MasterDashboardLayout";
import { PublicLayout } from "@app/app/layouts/PublicLayout";
import { SellerDashboardLayout } from "@app/app/layouts/SellerDashboardLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { RoleRoute } from "./router/RoleRoute";
import { routesByLayout } from "./router/appRoutes";
import type { UserRole } from "@features/auth/types";
import { AccessLevel } from "./router/accessLevels";

function nestedPath(fullPath: string, basePath: string) {
  if (fullPath === basePath) return "";
  return fullPath.replace(`${basePath}/`, "");
}

function appendToBase(basePath: string, sharedPath: string) {
  const clean = sharedPath.startsWith("/") ? sharedPath.slice(1) : sharedPath;
  return `${basePath}/${clean}`;
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
  const sellerRoutes = routesByLayout("seller");
  const adminActiveRoutes = adminRoutes.filter((route) => route.path === "/admin" || route.path === "/admin/page-builder");
  const sellerActiveRoutes = sellerRoutes.filter((route) => route.path === "/seller");
  const adminSharedRoutes = protectedRoutes.filter((route) =>
    route.accessLevels.includes(AccessLevel.MANAGER) ||
    route.accessLevels.includes(AccessLevel.ADMIN_LAWYER),
  );
  const masterSharedRoutes = protectedRoutes.filter((route) =>
    route.accessLevels.includes(AccessLevel.MASTER)
  );
  const sellerSharedRoutes = protectedRoutes.filter((route) =>
    route.accessLevels.includes(AccessLevel.SELLER)
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

          <Route element={<LightOnlyLayout />}>
            {unprotectedStandaloneRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<LightOnlyLayout />}>
              {protectedStandaloneRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={<route.component />} />
              ))}
            </Route>
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
                  element={<RoleRoute allowedRoles={(route.accessLevels as UserRole[] | undefined) ?? []} />}
                >
                  <Route
                    path={nestedPath(appendToBase("/master", route.path), "/master")}
                    element={<route.component />}
                  />
                </Route>
              ))}
            </Route>

            <Route path="/admin" element={<AdminDashboardLayout />}>
              {adminActiveRoutes.map((route) =>
                route.path === "/admin" ? (
                  <Route key={route.path} index element={<route.component />} />
                ) : (
                  <Route key={route.path} path={nestedPath(route.path, "/admin")} element={<route.component />} />
                ),
              )}
              {adminSharedRoutes.map((route) => (
                <Route
                  key={`admin-${route.path}`}
                  element={<RoleRoute allowedRoles={(route.accessLevels as UserRole[] | undefined) ?? []} />}
                >
                  <Route
                    path={nestedPath(appendToBase("/admin", route.path), "/admin")}
                    element={<route.component />}
                  />
                </Route>
              ))}
            </Route>

            <Route path="/manager" element={<AdminDashboardLayout />}>
              {adminSharedRoutes.map((route) => (
                <Route
                  key={`manager-${route.path}`}
                  element={<RoleRoute allowedRoles={(route.accessLevels as UserRole[] | undefined) ?? []} />}
                >
                  <Route
                    path={nestedPath(appendToBase("/manager", route.path), "/manager")}
                    element={<route.component />}
                  />
                </Route>
              ))}
            </Route>

            <Route path="/seller" element={<SellerDashboardLayout />}>
              {sellerActiveRoutes.map((route) =>
                route.path === "/seller" ? (
                  <Route key={route.path} index element={<route.component />} />
                ) : (
                  <Route key={route.path} path={nestedPath(route.path, "/seller")} element={<route.component />} />
                ),
              )}
              {sellerSharedRoutes.map((route) => (
                <Route
                  key={`seller-shared-${route.path}`}
                  element={<RoleRoute allowedRoles={(route.accessLevels as UserRole[] | undefined) ?? []} />}
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
                <p className="text-text-muted">Page not found</p>
                <a href="/" className="text-primary underline">
                  Back to home
                </a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
