import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@shared/components/organisms/PublicNavbar";
import { Footer } from "@shared/components/organisms/PublicFooter";
import { siteConfig } from "@app/app/config/site";

export function PublicLayout() {
  const { pathname } = useLocation();
  const isDevelopmentRoot = pathname === "/" && !siteConfig.isProd;
  const hideFooter = pathname === "/" || pathname === "/landing";
  const hideNavbar = isDevelopmentRoot;

  return (
    <div className="flex flex-col min-h-screen bg-bg antialiased">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
