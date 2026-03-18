import { Outlet } from "react-router-dom";
import Header from "@/presentation/components/organisms/Header";
import Footer from "@/presentation/components/organisms/Footer";
import FloatingChat from "@/presentation/components/organisms/FloatingChat";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
}
