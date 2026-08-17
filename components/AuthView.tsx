"use client";

import React, { useState } from "react";
import { LoginCredentials, SignupCredentials } from "@/types/auth";
import { Wallet, Mail, Lock, User as UserIcon, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, PieChart, SlidersHorizontal, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

interface AuthViewProps {
  onLogin: (credentials: LoginCredentials) => { success: boolean; message: string };
  onSignup: (credentials: SignupCredentials) => { success: boolean; message: string };
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSignup }) => {
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (mode === "login") {
      const res = onLogin({ email, password });
      if (!res.success) {
        setFeedback({ type: "error", message: res.message });
      }
    } else {
      const res = onSignup({ name, email, password });
      if (!res.success) {
        setFeedback({ type: "error", message: res.message });
      } else {
        setFeedback({ type: "success", message: res.message });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Daily Expense Tracker
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal Finance & Spending Analytics
            </p>
          </div>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>
      </header>

      {/* Main Authentication Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Product Feature Highlights */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Private & Local Account Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Take Control of Your <span className="text-indigo-600 dark:text-indigo-400">Daily Spending</span>
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
            Log transactions in seconds, visualize spending habits with interactive charts, and organize custom categories tailored to your family and daily life.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Category Visual Insights</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Category bar charts & donut breakdowns sorted by spending.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Kids & Family Icons</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dedicated icon categories for school, toys, daycare, and hobbies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {mode === "login" ? "Sign In to Your Account" : "Create a New Account"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === "login"
                ? "Enter your email and password to access your expense tracker."
                : "Sign up to start tracking your personal expenses."}
            </p>

            {/* Mode Switcher */}
            <div className="pt-3 grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => {
                  setMode("login");
                  setFeedback(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setFeedback(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  feedback.type === "error"
                    ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {feedback.type === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Name Field (Signup mode only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-500/20 transition-all mt-2"
            >
              {mode === "login" ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <span>Daily Expense Tracker SPA • Vercel Ready & Client-Side Persisted</span>
      </footer>
    </div>
  );
};
