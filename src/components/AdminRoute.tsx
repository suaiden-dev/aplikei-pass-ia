import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";

export default function AdminRoute() {
    const { isAdmin, loading, user } = useAdmin();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
