export type UserRole = "admin" | "customer";

// Espelho da tabela public.user_accounts no Supabase
export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  passportPhotoUrl?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type Admin = UserAccount & { role: "admin" };
export type Customer = UserAccount & { role: "customer" };
