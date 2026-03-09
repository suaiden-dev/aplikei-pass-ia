import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { checkIsAdmin } from "@/lib/admin";

interface AdminState {
    isAdmin: boolean;
    loading: boolean;
    user: { id: string; email: string } | null;
}

export function useAdmin(): AdminState {
    const { user, loading: authLoading } = useAuth();
    const [state, setState] = useState<AdminState>({
        isAdmin: false,
        loading: true,
        user: null,
    });

    useEffect(() => {
        if (!authLoading) {
            if (user && user.email) {
                const isAdmin = checkIsAdmin(user.email);
                setState({
                    isAdmin,
                    loading: false,
                    user: { id: user.id, email: user.email },
                });
            } else {
                setState({ isAdmin: false, loading: false, user: null });
            }
        }
    }, [user, authLoading]);

    return state;
}
