export const AccessLevel = {
  MASTER: "master",
  ADMIN_LAWYER: "admin_lawyer",
  MANAGER: "manager",
  SELLER: "seller",
  CUSTOMER: "customer",
} as const;

export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];
