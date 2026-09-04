import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, redirectTo: "/login" });
  response.cookies.set({
    name: "authjs.session-token",
    value: "",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: "__Secure-authjs.session-token",
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
