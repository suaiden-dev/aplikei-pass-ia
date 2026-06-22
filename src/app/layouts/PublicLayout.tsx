import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@shared/components/organisms/PublicNavbar";
import { Footer } from "@shared/components/organisms/PublicFooter";
import { DemoBookingProvider } from "@shared/components/organisms/DemoBookingModal";
import { siteConfig } from "@app/app/config/site";
import { useForceLightTheme } from "@shared/hooks/useForceLightTheme";

export function PublicLayout() {
  const { pathname } = useLocation();
  useForceLightTheme();
  const isDevelopmentRoot = pathname === "/" && !siteConfig.isProd;
  const hideNavbar = isDevelopmentRoot;
  const hideFooter = isDevelopmentRoot;

  return (
    <DemoBookingProvider>
      <div className="public-page flex flex-col antialiased">
        {!hideNavbar && <Navbar />}
        <main className="flex-1">
          <Outlet />
        </main>
        {!hideFooter && <Footer />}
      </div>
    </DemoBookingProvider>
  );
}
