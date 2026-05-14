export type UserRole = "master" | "admin_lawyer" | "manager" | "seller" | "customer";

// Espelho da tabela public.user_accounts no Supabase
export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  avatarOffsetX: number;
  avatarOffsetY: number;
  avatarZoom: number;
  passportPhotoUrl?: string | null;
  role: UserRole;
  officeId: string | null;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Manager = UserAccount & { role: "manager" };
export type Customer = UserAccount & { role: "customer" };
