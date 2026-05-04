// UserAccount é um tipo de visão (camelCase) mapeado da tabela user_accounts
// Mantido manualmente pois a tabela usa snake_case mas o app usa camelCase

export type UserRole = "admin" | "customer" | "master" | "seller";

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
  createdAt: string;
  updatedAt: string;
}

export type Admin = UserAccount & { role: "admin" };
export type Customer = UserAccount & { role: "customer" };
