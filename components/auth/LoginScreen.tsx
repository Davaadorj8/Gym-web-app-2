'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAppLocale } from '@/components/I18nProvider';
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface LoginScreenProps {
  onLogin: (identifier: string, password?: string, role?: UserRole, locale?: string) => void;
  isLoading: boolean;
  statusMessage: string | null;
  onClearStatus: () => void;
}

export default function LoginScreen({
  onLogin,
  isLoading,
  statusMessage,
  onClearStatus,
}: LoginScreenProps) {
  const { locale, setLocale } = useAppLocale();
  const tAuth = useTranslations('Auth');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<UserRole>('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(identifier, password, loginRole, locale);
  };

  return (
    <main
      id="login-page-container"
      className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-6 text-foreground relative"
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-primary/10 via-cyan-500/5 to-transparent blur-3xl opacity-60" />
      </div>

      {/* Language Switcher Bar at top right */}
      <div
        id="language-switch-bar"
        className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2 bg-card/90 border border-border rounded-full p-1.5 shadow-lg backdrop-blur-md"
      >
        <Globe className="w-4 h-4 text-primary ml-1.5 shrink-0" />
        <div className="flex bg-background rounded-full p-0.5 border border-border">
          <button
            id="lang-btn-mn"
            type="button"
            onClick={() => setLocale('mn')}
            className={`px-3 py-1 text-xs font-extrabold rounded-full font-mono transition-all cursor-pointer ${
              locale === 'mn'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Монгол
          </button>
          <button
            id="lang-btn-en"
            type="button"
            onClick={() => setLocale('en')}
            className={`px-3 py-1 text-xs font-extrabold rounded-full font-mono transition-all cursor-pointer ${
              locale === 'en'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div
        id="login-card"
        className="relative w-full max-w-[440px] bg-card border border-border rounded-[28px] shadow-2xl p-7 sm:p-9 z-10 overflow-hidden"
      >
        {/* Top Glow Accent Bar */}
        <div
          id="card-top-accent"
          className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-primary"
        />

        {/* Brand Header */}
        <div id="brand-header" className="flex flex-col items-center text-center mt-1">
          {/* Logo Icon */}
          <div
            id="brand-logo-badge"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-105"
          >
            <Zap className="w-8 h-8 text-primary-foreground fill-primary-foreground" strokeWidth={2.5} />
          </div>

          {/* Title & Subtitle */}
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
            {tAuth('brandSubtitle')}
          </p>
        </div>

        {/* Login Form */}
        <form id="login-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Role Selection Tabs */}
          <div id="login-role-selector-group" className="space-y-1.5">
            <label className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
              {locale === 'mn' ? 'Хэрэглэгчийн Эрх / Үүрэг' : 'Access Role'}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-background border border-border p-1 rounded-xl">
              <button
                id="btn-role-select-admin"
                type="button"
                onClick={() => {
                  setLoginRole('admin');
                  if (!identifier || identifier.includes('staff')) {
                    setIdentifier('admin@archegym.com');
                  }
                }}
                className={`py-2 px-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginRole === 'admin'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>👑</span>
                <span>{locale === 'mn' ? 'Админ' : 'Admin'}</span>
              </button>
              <button
                id="btn-role-select-staff"
                type="button"
                onClick={() => {
                  setLoginRole('staff');
                  if (!identifier || identifier.includes('admin')) {
                    setIdentifier('staff@archegym.com');
                  }
                }}
                className={`py-2 px-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginRole === 'staff'
                    ? 'bg-sky-400 text-black shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>👤</span>
                <span>{locale === 'mn' ? 'Ресепшн / Ажилтан' : 'Staff'}</span>
              </button>
            </div>
          </div>

          {/* Email / Username Field */}
          <div id="username-field-group">
            <label
              htmlFor="username-input"
              className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono mb-2"
            >
              {tAuth('emailOrRegIdLabel')}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="username-input"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  onClearStatus();
                }}
                required
                placeholder={
                  loginRole === 'admin' ? 'admin@archegym.com' : 'staff@archegym.com'
                }
                className="w-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground text-sm rounded-xl pl-10 pr-4 py-3 placeholder:text-muted-foreground/60 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div id="password-field-group">
            <label
              htmlFor="password-input"
              className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono mb-2"
            >
              {tAuth('passwordLabel')}
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  onClearStatus();
                }}
                required
                placeholder={tAuth('passwordPlaceholder')}
                className="w-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground text-sm rounded-xl pl-10 pr-11 py-3 placeholder:text-muted-foreground/60 outline-none transition-all"
              />
              <button
                id="password-toggle-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                title={showPassword ? tAuth('hidePassword') : tAuth('showPassword')}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Status / Feedback message */}
          {statusMessage && (
            <div
              id="auth-status-message"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="submit-login-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-primary hover:opacity-90 active:scale-[0.99] text-primary-foreground font-extrabold text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? tAuth('signingIn') : tAuth('signInButton')}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 text-primary-foreground stroke-[2.5]" />}
          </button>
        </form>
      </div>
    </main>
  );
}
