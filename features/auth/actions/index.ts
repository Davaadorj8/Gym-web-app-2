"use server";

import { signIn, signOut } from "@/auth";
import { createSafeAction } from "@/lib/actions/safeAction";
import { LoginSchema } from "../types";

export const loginWithCredentials = createSafeAction(LoginSchema, async (data) => {
  // Safe authentication action hook
  return { email: data.email, success: true };
});

export async function loginWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
