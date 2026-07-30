"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LogIn, Eye, EyeOff } from "lucide-react";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success && result.data) {
      switch (result.data.role) {
        case "super_admin":
          router.push("/admin");
          break;
        case "org_admin":
          router.push("/dashboard/hr");
          break;
        case "employee":
          router.push("/dashboard/employee");
          break;
        default:
          router.push("/");
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-white rounded-full" />
          <div className="absolute bottom-32 right-16 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-white rounded-full" />
        </div>
        <div className="relative text-white max-w-md">
          <Heart className="w-12 h-12 mb-6" fill="currentColor" />
          <h2 className="text-3xl font-bold mb-4">Welcome to Manovyatha</h2>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Your trusted platform for employee wellness assessment and psychological insights. Confidential, AI-powered, and designed for well-being.
          </p>
          <div className="mt-10 flex gap-6">
            <div>
              <p className="text-2xl font-bold">6</p>
              <p className="text-indigo-200 text-sm">Wellness Dimensions</p>
            </div>
            <div>
              <p className="text-2xl font-bold">AI</p>
              <p className="text-indigo-200 text-sm">Powered Insights</p>
            </div>
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-indigo-200 text-sm">Confidential</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md page-enter">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <Heart className="w-8 h-8 text-indigo-600" fill="currentColor" />
              <span className="text-xl font-bold text-gray-900">Manovyatha</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 card-shadow-lg border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h1>
            <p className="text-gray-500 text-sm mb-8">Enter your credentials to access the platform</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field !pr-10"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
              >
                {loading ? (
                  <span className="animate-pulse">Signing in...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
