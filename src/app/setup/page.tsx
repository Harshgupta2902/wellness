"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Database, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { setupSuperAdmin } from "@/actions/auth";

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSetup = async () => {
    setStatus("loading");
    const result = await setupSuperAdmin();

    if (result.success) {
      setStatus("success");
      setMessage(result.message);
      setTimeout(() => router.push("/login"), 2500);
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] pattern-dots flex items-center justify-center px-4">
      <div className="w-full max-w-lg page-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="Manovyatha" width={40} height={40} />
            <span className="text-2xl font-bold text-[#022932]">Manovyatha</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-10 card-shadow-lg border border-[#d4e0e3] text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2a787c]/10 text-[#2a787c] mb-6">
            <Database className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-[#022932] mb-2">Initial Setup</h1>
          <p className="text-[#5b7a80] text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Create the Super Admin account to start managing the platform.
            Make sure your database tables are created from{" "}
            <code className="bg-[#f0f7f8] px-1.5 py-0.5 rounded text-xs font-mono text-[#2a787c]">supabase_setup.sql</code> first.
          </p>

          {status === "success" && (
            <div className="mb-6 p-4 rounded-xl bg-[#2a787c]/10 border border-[#2a787c]/20 text-[#022932] text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2a787c] flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button
            onClick={handleSetup}
            disabled={status === "loading" || status === "success"}
            className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
          >
            {status === "loading" ? (
              <span className="animate-pulse">Creating Super Admin...</span>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Done! Redirecting to login...
              </>
            ) : (
              <>
                Create Super Admin
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Credentials info */}
          <div className="mt-6 p-4 rounded-xl bg-[#f0f7f8] border border-[#d4e0e3]">
            <p className="text-xs text-[#5b7a80] mb-2 font-medium">Default credentials:</p>
            <div className="space-y-1">
              <p className="text-sm text-[#022932] font-mono">admin@manovyatha.com</p>
              <p className="text-sm text-[#022932] font-mono">Wellness@12345</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#8ba5aa] mt-6">
          <Link href="/" className="hover:text-[#2a787c] transition-colors">← Back to home</Link>
          <span className="mx-3">·</span>
          <Link href="/login" className="hover:text-[#2a787c] transition-colors">Go to login →</Link>
        </p>
      </div>
    </div>
  );
}
