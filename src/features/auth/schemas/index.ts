import { z } from "zod";

export const LoginCredentialsSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentialsInput = z.infer<typeof LoginCredentialsSchema>;

export const LoginSchema = LoginCredentialsSchema;
export type LoginInput = LoginCredentialsInput;
