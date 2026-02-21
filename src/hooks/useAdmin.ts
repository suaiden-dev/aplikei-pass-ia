import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Emails autorizados como admin. 
// Futuramente migrar para user_metadata ou tabela admin_users.
const ADMIN_EMAILS = [
    "info@thefutureofenglish.com",
    "admin@suaiden.com",
    "fernanda@suaiden.com",
];

interface AdminState {
    isAdmin: boolean;
    loading: boolean;
    user: { id: string; email: string } | null;
}

export function useAdmin(): AdminState {
    const [state, setState] = useState<AdminState>({
        isAdmin: false,
        loading: true,
        user: null,
    });

    useEffect(() => {
        const checkAdmin = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user && user.email) {
                const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
                setState({
                    isAdmin,
                    loading: false,
                    user: { id: user.id, email: user.email },
                });
            } else {
                setState({ isAdmin: false, loading: false, user: null });
            }
        };

        checkAdmin();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user?.email) {
                const isAdmin = ADMIN_EMAILS.includes(
                    session.user.email.toLowerCase()
                );
                setState({
                    isAdmin,
                    loading: false,
                    user: { id: session.user.id, email: session.user.email },
                });
            } else {
                setState({ isAdmin: false, loading: false, user: null });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return state;
}
