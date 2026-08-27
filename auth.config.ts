import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-secret-temporary-bypass-1234567890",
  session: { strategy: "jwt" as const },
  providers: [
    GitHub,
    Credentials({
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "any@example.com" },
        password: { label: "Password", type: "password", placeholder: "any password" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === "development") {
          return {
            id: "dev-user-id-1",
            name: "Dev Admin",
            email: (credentials?.email as string) || "admin@dev.local",
            role: "ADMIN",
          } as any;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: any; request: { nextUrl: any } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isLogin = nextUrl.pathname.startsWith("/login");

      if (isDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
