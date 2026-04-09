import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail")
    .email("Digite um e-mail válido, ex: nome@email.com"),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(1, "Informe seu nome completo")
    .min(3, "O nome precisa ter pelo menos 3 caracteres"),
  email: z
    .string()
    .min(1, "Informe seu e-mail")
    .email("Digite um e-mail válido, ex: nome@email.com"),
  password: z
    .string()
    .min(1, "Crie uma senha")
    .min(6, "A senha precisa ter pelo menos 6 caracteres"),
  phoneNumber: z
    .string()
    .min(1, "Informe seu telefone")
    .min(10, "Digite um telefone válido com DDD, ex: (11) 91234-5678"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Você precisa aceitar os termos para continuar",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
