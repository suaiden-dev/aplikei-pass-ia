import { Outlet } from "react-router-dom";
import { Navbar } from "../components/organisms/PublicNavbar";
import { Footer } from "../components/organisms/PublicFooter";

export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-bg antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
