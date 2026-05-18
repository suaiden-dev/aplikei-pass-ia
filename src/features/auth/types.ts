import { AccessLevel } from "../../app/router/accessLevels";

// UserAccount é um tipo de visão (camelCase) mapeado da tabela user_accounts
// Mantido manualmente pois a tabela usa snake_case mas o app usa camelCase

export type UserRole = `${AccessLevel}`;

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
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Manager = UserAccount & { role: "manager" };
export type Customer = UserAccount & { role: "customer" };

export interface Office {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  cnpj: string | null;
  email: string | null;
  website: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
