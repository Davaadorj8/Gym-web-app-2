"use client";

import React, { useState } from "react";
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Globe,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/I18nProvider";
import { loginWithGitHub } from "../actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const { locale, setLocale } = useAppLocale();
  const tAuth = useTranslations("Auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<"admin" | "staff">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginPayload = {
        email: email || (loginRole === "admin" ? "admin@archegym.com" : "staff@archegym.com"),
        password: password || "password123",
        role: loginRole,
      };

      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.error ||
            (locale === "mn"
              ? "Нэвтрэх нэр эсвэл нууц үг буруу байна."
              : "Invalid email/username or password.")
        );
        setLoading(false);
      } else {
        // Successful login: navigate to dashboard
        window.location.href = data.redirectTo || "/dashboard/directory";
      }
    } catch {
      setError(
        locale === "mn"
          ? "Нэвтрэх явцад алдаа гарлаа. Дахин оролдоно уу."
          : "An unexpected error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[440px] flex flex-col items-center">
      {/* Language Switcher Bar */}
      <div
        id="language-switch-bar"
        className="mb-4 self-end flex items-center gap-2 bg-card/90 border border-border rounded-full p-1.5 shadow-md backdrop-blur-md"
      >
        <Globe className="w-4 h-4 text-primary ml-1.5 shrink-0" />
        <div className="flex bg-background rounded-full p-0.5 border border-border">
          <button
            id="lang-btn-mn"
            type="button"
            onClick={() => setLocale("mn")}
            className={`px-3 py-1 text-xs font-extrabold rounded-full font-mono transition-all cursor-pointer ${
              locale === "mn"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Монгол
          </button>
          <button
            id="lang-btn-en"
            type="button"
            onClick={() => setLocale("en")}
            className={`px-3 py-1 text-xs font-extrabold rounded-full font-mono transition-all cursor-pointer ${
              locale === "en"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div
        id="login-form-card"
        className="relative w-full bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-7 z-10 overflow-hidden"
      >
        {/* Top Glow Accent Bar */}
        <div
          id="card-top-accent"
          className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-primary"
        />

        {/* Brand Header */}
        <div id="brand-header" className="flex flex-col items-center text-center mt-1">
          <div
            id="brand-logo-badge"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-105"
          >
            <Zap className="w-8 h-8 text-primary-foreground fill-primary-foreground" strokeWidth={2.5} />
          </div>

          <h1
            id="brand-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-4"
          >
            Arche Gym
          </h1>
          <p
            id="brand-subtitle"
            className="text-[11px] font-bold tracking-[0.22em] text-muted-foreground uppercase font-mono mt-1.5"
          >
            {tAuth("brandSubtitle")}
          </p>
        </div>

        {/* Role Selection Quick-Tabs */}
        <div id="login-role-selector-group" className="mt-6 space-y-1.5">
          <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
            {locale === "mn" ? "Хэрэглэгчийн Эрх / Үүрэг" : "Quick Demo Access"}
          </label>
          <div className="grid grid-cols-2 gap-2 bg-background border border-border p-1 rounded-xl">
            <button
              id="btn-role-select-admin"
              type="button"
              onClick={() => {
                setLoginRole("admin");
                if (!email || email.includes("staff")) {
                  setEmail("admin@archegym.com");
                }
              }}
              className={`py-2 px-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginRole === "admin"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>👑</span>
              <span>{locale === "mn" ? "Админ" : "Admin"}</span>
            </button>
            <button
              id="btn-role-select-staff"
              type="button"
              onClick={() => {
                setLoginRole("staff");
                if (!email || email.includes("admin")) {
                  setEmail("staff@archegym.com");
                }
              }}
              className={`py-2 px-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginRole === "staff"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>🎫</span>
              <span>{locale === "mn" ? "Ажилтан" : "Staff"}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            id="login-error-alert"
            className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2 font-mono">
              {locale === "mn" ? "И-мэйл эсвэл Хэрэглэгчийн нэр" : "Email or Username"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                id="login-email-input"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@archegym.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2 font-mono">
              {locale === "mn" ? "Нууц үг" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-input rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
              <button
                id="btn-toggle-password-visibility"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            id="login-submit-btn"
            type="submit"
            loading={loading}
            className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-xl text-sm transition-all shadow-md shadow-primary/20 hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{locale === "mn" ? "Системд Нэвтрэх" : "Sign In to Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative px-3 bg-card text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
            {locale === "mn" ? "Эсвэл" : "Or continue with"}
          </span>
        </div>

        <Button
          id="login-github-btn"
          type="button"
          variant="outline"
          onClick={async () => {
            setError("");
            setLoading(true);
            try {
              const res = await loginWithGitHub();
              if (res && !res.success && res.error) {
                setError(res.error);
              }
            } catch (err: unknown) {
              if (
                err &&
                typeof err === "object" &&
                "digest" in err &&
                String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
              ) {
                throw err;
              }
              setError(
                locale === "mn"
                  ? "GitHub нэвтрэлт тохируулагдаагүй байна."
                  : "GitHub OAuth is not configured or failed to connect."
              );
            } finally {
              setLoading(false);
            }
          }}
          className="w-full h-10 bg-background hover:bg-muted border-border text-foreground font-medium rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>GitHub OAuth</span>
        </Button>
      </div>
    </div>
  );
}
