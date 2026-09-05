"use server";

import { signIn, signOut } from "@/auth";
import { createSafeAction } from "@/server/actions/safeAction";
import { LoginSchema } from "../types";

export const loginWithCredentials = createSafeAction(LoginSchema, async (data) => {
  // Safe authentication action hook
  return { email: data.email, success: true };
});

export async function loginWithGitHub() {
  if (!process.env.AUTH_GITHUB_ID && !process.env.GITHUB_ID) {
    return {
      success: false,
      error: "GitHub OAuth credentials are not configured in environment variables.",
    };
  }
  try {
    await signIn("github", { redirectTo: "/dashboard" });
    return { success: true };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return { success: false, error: "Failed to connect to GitHub OAuth provider." };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
