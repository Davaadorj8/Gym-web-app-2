import GitHub from "next-auth/providers/github";

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "development_auth_secret_minimum_32_characters_long_key",
  session: { strategy: "jwt" as const },
  providers: [GitHub],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token?.sub && session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
