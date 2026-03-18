
export interface UserSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null;
  accessToken?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | null;
  error?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export type AuthStateChangeHandler = (session: UserSession) => void;

export interface IAuthService {
  getSession(): Promise<UserSession>;
  login(email: string, password: string): Promise<AuthResponse>;
  signup(request: SignupRequest): Promise<AuthResponse>;
  logout(): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<{ error?: string }>;
  resetPassword(newPassword: string): Promise<{ error?: string }>;
  onAuthStateChange(handler: AuthStateChangeHandler): { unsubscribe: () => void };
  signInWithOtp(email: string): Promise<{ error?: string }>;
  verifyOtp(email: string, token: string, type: 'email' | 'sms' | 'signup' | 'invite' | 'recovery' | 'email_change' | 'phone_change'): Promise<AuthResponse>;
}
