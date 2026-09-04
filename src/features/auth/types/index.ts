export * from "../schemas";

export interface AuthSessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  permissions?: string[];
}
