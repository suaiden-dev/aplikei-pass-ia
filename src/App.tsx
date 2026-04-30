import { Suspense } from "react";
import MaintenancePage from "./pages/MaintenancePage";

function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0A0B]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0066FF] border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MaintenancePage />
    </Suspense>
  );
}
