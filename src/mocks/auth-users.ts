import type { UserAccount, UserAccountRole } from "../models/users-account";

export interface MockAuthUser extends UserAccount {
  password: string;
}

export interface MockAuthAccountHint {
  email: string;
  role: UserAccountRole;
  password: string;
  name: string;
}

export const mockAuthDefaultPassword = "Aplikei@123";

const now = "2026-04-27T19:00:00.000Z";

export const mockAuthUsersSeed: MockAuthUser[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    role: "admin",
    email: "admin@aplikei.com",
    name: "Admin Aplikei",
    profileUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Admin%20Aplikei",
    phone: "+55 11 90000-0001",
    metadata: { department: "operations" },
    isActive: true,
    termsAcceptedAt: now,
    lastSignInAt: now,
    createdAt: now,
    updatedAt: now,
    password: mockAuthDefaultPassword,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    role: "customer",
    email: "customer@aplikei.com",
    name: "Customer Demo",
    profileUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Customer%20Demo",
    phone: "+55 11 90000-0002",
    metadata: { currentProcesses: ["B1/B2", "Troca de Status"] },
    isActive: true,
    termsAcceptedAt: now,
    lastSignInAt: now,
    createdAt: now,
    updatedAt: now,
    password: mockAuthDefaultPassword,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    role: "seller",
    email: "seller@aplikei.com",
    name: "Seller Demo",
    profileUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Seller%20Demo",
    phone: "+55 11 90000-0003",
    metadata: { region: "sudeste" },
    isActive: true,
    termsAcceptedAt: now,
    lastSignInAt: now,
    createdAt: now,
    updatedAt: now,
    password: mockAuthDefaultPassword,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    role: "master",
    email: "master@aplikei.com",
    name: "Master Aplikei",
    profileUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Master%20Aplikei",
    phone: "+55 11 90000-0004",
    metadata: { access: "global" },
    isActive: true,
    termsAcceptedAt: now,
    lastSignInAt: now,
    createdAt: now,
    updatedAt: now,
    password: mockAuthDefaultPassword,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    role: "customer",
    email: "ana.silva@aplikei.com",
    name: "Ana Silva",
    profileUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Ana%20Silva",
    phone: "+55 11 90000-0005",
    metadata: { currentProcess: "F-1" },
    isActive: true,
    termsAcceptedAt: now,
    lastSignInAt: null,
    createdAt: now,
    updatedAt: now,
    password: mockAuthDefaultPassword,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    role: "seller",
    email: "marco.vendas@aplikei.com",
    name: "Marco Vendas",
    profileUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Marco%20Vendas",
    phone: "+55 11 90000-0006",
    metadata: { team: "inside-sales" },
    isActive: true,
    termsAcceptedAt: now,
    lastSignInAt: null,
    createdAt: now,
    updatedAt: now,
    password: mockAuthDefaultPassword,
  },
];

export const mockAuthAccountHints: MockAuthAccountHint[] = mockAuthUsersSeed.map((user) => ({
  email: user.email ?? "",
  role: user.role,
  password: user.password,
  name: user.name,
}));
