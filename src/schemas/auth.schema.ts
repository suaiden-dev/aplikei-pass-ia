import { z } from "zod";

export const getLoginSchema = (t: any = {}) => z.object({
  email: z
    .string()
    .min(1, t?.required || "Required")
    .email(t?.emailInvalid || "Invalid email"),
  password: z
    .string()
    .min(1, t?.required || "Required")
    .min(6, t?.passwordMin || "Must be at least 6 characters"),
});

export const getSignUpSchema = (t: any = {}) => z.object({
  fullName: z
    .string()
    .min(1, t?.required || "Required")
    .min(3, t?.nameMin || "Must be at least 3 characters"),
  email: z
    .string()
    .min(1, t?.required || "Required")
    .email(t?.emailInvalid || "Invalid email"),
  password: z
    .string()
    .min(1, t?.required || "Required")
    .min(6, t?.passwordMin || "Must be at least 6 characters"),
  phoneNumber: z
    .string()
    .min(1, t?.required || "Required")
    .min(10, t?.phoneInvalid || "Invalid phone number"),
  terms: z.boolean().refine((val) => val === true, {
    message: t?.acceptTerms || "You must accept the terms",
  }),
});

// Legacy exports for backward compatibility if needed, but we should migrate all callers
export const loginSchema = getLoginSchema({}); 
export const signUpSchema = getSignUpSchema({});

export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;
export type SignUpInput = z.infer<ReturnType<typeof getSignUpSchema>>;
