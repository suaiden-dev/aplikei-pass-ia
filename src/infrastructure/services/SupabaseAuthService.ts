
import { IAuthService, UserSession, AuthResponse, SignupRequest } from "@/application/ports/IAuthService";
import { supabase } from "@/integrations/supabase/client";

export class SupabaseAuthService implements IAuthService {
  async getSession(): Promise<UserSession> {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      user: session?.user ? { 
        id: session.user.id, 
        email: session.user.email,
        user_metadata: session.user.user_metadata as Record<string, unknown>
      } : null,
      accessToken: session?.access_token
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };

    return {
      user: data.user ? { 
        id: data.user.id, 
        email: data.user.email,
        user_metadata: data.user.user_metadata as Record<string, unknown>
      } : null
    };
  }

  async signup(request: SignupRequest): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          full_name: request.fullName,
          phone: request.phone,
        },
      },
    });

    if (error) return { user: null, error: error.message };

    return {
      user: data.user ? { 
        id: data.user.id, 
        email: data.user.email,
        user_metadata: data.user.user_metadata as Record<string, unknown>
      } : null
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async sendPasswordResetEmail(email: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message };
  }

  async resetPassword(newPassword: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message };
  }

  onAuthStateChange(handler: (session: UserSession) => void): { unsubscribe: () => void } {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      handler({
        user: newSession?.user ? { 
          id: newSession.user.id, 
          email: newSession.user.email,
          user_metadata: newSession.user.user_metadata as Record<string, unknown> 
        } : null,
        accessToken: newSession?.access_token
      });
    });

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }

  async signInWithOtp(email: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    return { error: error?.message };
  }

  async verifyOtp(
    email: string, 
    token: string, 
    type: 'email' | 'sms' | 'signup' | 'invite' | 'recovery' | 'email_change' | 'phone_change'
  ): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as 'signup' | 'invite' | 'recovery' | 'magiclink' | 'email_change',
    });

    if (error) return { user: null, error: error.message };

    return {
      user: data.user ? { 
        id: data.user.id, 
        email: data.user.email,
        user_metadata: data.user.user_metadata as Record<string, unknown>
      } : null
    };
  }
}
