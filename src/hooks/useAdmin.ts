import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import { checkIsAdmin } from "@/lib/admin";

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
                const isAdmin = checkIsAdmin(user.email);
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
                const isAdmin = checkIsAdmin(session.user.email);
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
