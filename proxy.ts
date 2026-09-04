import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse, NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client with graceful fallback for local/preview environments
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

// Allow 10 requests per 10 seconds per IP
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
    })
  : null;

const { auth } = NextAuth(authConfig);

export const proxy = auth(async (req: NextRequest) => {
  // 1. Edge Rate Limiter
  if (ratelimit) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    try {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
    } catch {
      // Gracefully continue on transient Redis errors
    }
  }

  // Auth logic is handled by the 'authorized' callback in authConfig
  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
