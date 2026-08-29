import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/security/password";
import prisma from "@/lib/prisma";
import { getStaffRepository } from "@/lib/repositories";

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const inputIdentifier = (credentials.email as string).trim().toLowerCase();
        const inputPassword = credentials.password as string;

        // 1. Try to find user in the Database via Prisma (if configured)
        let staffUser = null;
        if (process.env.DATABASE_URL) {
          try {
            const found = await prisma.staffAccount.findFirst({
              where: {
                OR: [
                  { username: { equals: inputIdentifier, mode: 'insensitive' } },
                  { email: { equals: inputIdentifier, mode: 'insensitive' } }
                ]
              }
            });
            if (found) {
              staffUser = found;
            }
          } catch (e) {
            console.error("Database lookup error:", e);
          }
        }

        // 2. If not found in DB or DB not set up, look up in InMemory/Mock repository
        if (!staffUser) {
          const staffRepository = getStaffRepository();
          const found = await staffRepository.findByUsername(inputIdentifier);
          if (found) {
            staffUser = found;
          } else {
            // Check by email in mock repo
            const allStaff = await staffRepository.findAll();
            const foundByEmail = allStaff.find(
              (s) => s.email?.toLowerCase() === inputIdentifier
            );
            if (foundByEmail) {
              staffUser = foundByEmail;
            }
          }
        }

        // 3. If a staff user was found, compare hashed password
        if (staffUser) {
          if (staffUser.status === 'Suspended') {
            throw new Error('This staff account has been suspended.');
          }

          // Verify password using bcryptjs
          const isValid = await verifyPassword(inputPassword, staffUser.passwordHash);
          if (isValid) {
            return {
              id: staffUser.id,
              name: staffUser.fullName,
              email: staffUser.email || `${staffUser.username}@archegym.com`,
              role: staffUser.role === 'admin' ? 'ADMIN' : 'STAFF',
              permissions: staffUser.permissions || [],
            } as any;
          }
        }

        // 4. Default bypass fallback for seamless developer onboarding / first launch
        if (process.env.NODE_ENV === "development") {
          return {
            id: "dev-user-id-1",
            name: "Dev Admin",
            email: inputIdentifier || "admin@dev.local",
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
