import { describe, it, expect } from 'vitest';
import { LoginCredentialsSchema } from '@/features/auth/schemas';
import { authConfig } from '@/auth.config';
import { encode, decode } from 'next-auth/jwt';

describe('Auth Validation & Callbacks', () => {
  describe('LoginCredentialsSchema (Zod Validation)', () => {
    it('validates correct email and password inputs', () => {
      const result = LoginCredentialsSchema.safeParse({
        email: 'admin@archegym.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('admin@archegym.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('rejects empty email or empty password', () => {
      const emptyEmail = LoginCredentialsSchema.safeParse({
        email: '',
        password: 'password123',
      });
      expect(emptyEmail.success).toBe(false);

      const emptyPassword = LoginCredentialsSchema.safeParse({
        email: 'admin@archegym.com',
        password: '',
      });
      expect(emptyPassword.success).toBe(false);

      const missingFields = LoginCredentialsSchema.safeParse({});
      expect(missingFields.success).toBe(false);
    });
  });

  describe('authConfig authorize handler', () => {
    const rawProvider = authConfig.providers.find(
      (p) => typeof p === 'object' && p !== null && ('authorize' in p || 'options' in p)
    ) as { authorize?: (credentials: unknown, req?: unknown) => Promise<unknown>; options?: { authorize?: (credentials: unknown) => Promise<unknown> } } | undefined;

    const authorizeFn = rawProvider?.options?.authorize || rawProvider?.authorize;

    it('credentials provider is configured with authorize function', () => {
      expect(rawProvider).toBeDefined();
      expect(typeof authorizeFn).toBe('function');
    });

    it('returns null on invalid / empty credentials schema parse failure', async () => {
      if (!authorizeFn) return;
      const result = await authorizeFn({
        email: '',
        password: '',
      });
      expect(result).toBeNull();
    });

    it('authorizes admin credentials in development', async () => {
      if (!authorizeFn) return;
      const result = (await authorizeFn({
        email: 'admin@archegym.com',
        password: 'anypassword',
      })) as { role?: string; email?: string } | null;

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect(result.email).toContain('admin');
        expect(result.role).toBe('admin');
      }
    });

    it('authorizes staff credentials in development', async () => {
      if (!authorizeFn) return;
      const result = (await authorizeFn({
        email: 'staff@archegym.com',
        password: 'anypassword',
      })) as { role?: string; email?: string } | null;

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect(result.email).toContain('staff');
        expect(result.role).toBe('staff');
      }
    });
  });

  describe('NextAuth JWT & Session Callbacks', () => {
    it('populates token with user fields in jwt callback', async () => {
      const jwtCallback = authConfig.callbacks?.jwt;
      if (!jwtCallback) throw new Error('jwt callback missing');

      const mockUser = {
        id: 'usr-123',
        name: 'Test Admin',
        email: 'admin@archegym.com',
        role: 'admin',
        permissions: ['MANAGE_MEMBERS'],
      };

      const token = await jwtCallback({ token: {}, user: mockUser } as never);
      expect(token).toBeDefined();
      expect(token?.id).toBe('usr-123');
      expect(token?.role).toBe('admin');
      expect(token?.permissions).toEqual(['MANAGE_MEMBERS']);
    });

    it('populates session.user with token fields in session callback', async () => {
      const sessionCallback = authConfig.callbacks?.session;
      if (!sessionCallback) throw new Error('session callback missing');

      const mockToken = {
        id: 'usr-123',
        role: 'admin',
        permissions: ['MANAGE_MEMBERS'],
      };

      const baseSession = {
        user: { name: 'Test Admin', email: 'admin@archegym.com' },
        expires: '2099-01-01',
      };

      const session = await sessionCallback({ session: baseSession, token: mockToken } as never);
      expect(session).toBeDefined();
      expect(session?.user?.id).toBe('usr-123');
      expect(session?.user?.role).toBe('admin');
      expect(session?.user?.permissions).toEqual(['MANAGE_MEMBERS']);
    });
  });

  describe('JWT Session Token Manual Issuance', () => {
    it('successfully encodes and decodes Auth.js session JWT token', async () => {
      const secret = (authConfig.secret as string) || 'dev-secret-bypass';
      const salt = 'authjs.session-token';
      const userPayload = {
        id: 'usr-dev-123',
        name: 'Arche Admin',
        email: 'admin@archegym.com',
        role: 'admin',
        permissions: ['MANAGE_MEMBERS', 'VIEW_ANALYTICS'],
        sub: 'usr-dev-123',
      };

      const token = await encode({
        token: userPayload,
        secret,
        salt,
        maxAge: 30 * 24 * 60 * 60,
      });

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);

      const decoded = await decode({
        token,
        secret,
        salt,
      });

      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe('usr-dev-123');
      expect(decoded?.email).toBe('admin@archegym.com');
      expect(decoded?.role).toBe('admin');
    });

    it('dev-login POST route returns successful response and sets session cookies', async () => {
      const { POST } = await import('@/app/api/auth/dev-login/route');
      const req = new Request('http://localhost:3000/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@archegym.com',
          password: 'anypassword',
          role: 'admin',
        }),
      });

      const res = await POST(req as never);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.user.email).toContain('admin');
      expect(json.user.role).toBe('admin');
      expect(json.redirectTo).toBe('/dashboard/directory');

      // Check cookie headers
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('authjs.session-token');
    });
  });
});
