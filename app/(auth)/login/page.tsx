"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  Building2,
  Phone,
  Scale,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    email: "analyst@swedbank.lv",
    password: "demo123",
    role: "BANK_ANALYST",
    label: "Bank Analyst",
    name: "Anna Berzina",
    description: "Monitor transactions, flag anomalies, block suspicious activity",
    icon: Building2,
    color: "#FF6100",
    bgClass: "from-[#FF6100]/20 to-[#FF6100]/5",
    borderClass: "border-[#FF6100]/20 hover:border-[#FF6100]/40",
  },
  {
    email: "operator@lmt.lv",
    password: "demo123",
    role: "TELECOM_OPERATOR",
    label: "Telecom Operator",
    name: "Janis Kalnins",
    description: "Analyze phone metadata, trace spoofed IDs, detect vishing",
    icon: Phone,
    color: "#3B82F6",
    bgClass: "from-[#3B82F6]/20 to-[#3B82F6]/5",
    borderClass: "border-[#3B82F6]/20 hover:border-[#3B82F6]/40",
  },
  {
    email: "officer@fid.gov.lv",
    password: "demo123",
    role: "AUTHORITY_OFFICER",
    label: "Authority Officer",
    name: "Martins Liepins",
    description: "Investigate cases, issue legal orders, coordinate prosecution",
    icon: Scale,
    color: "#8B5CF6",
    bgClass: "from-[#8B5CF6]/20 to-[#8B5CF6]/5",
    borderClass: "border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40",
  },
];

function FloatingShape({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute rounded-full opacity-[0.07] blur-xl ${className}`}
      style={style}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRole, setLastRole] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleDemoLogin(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setLastRole(account.role);
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: account.email,
      password: account.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Demo account not available. Run the seed script first.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-swed-dark relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 97, 0, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 97, 0, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient orbs */}
        <FloatingShape
          className="w-[500px] h-[500px] bg-swed-orange animate-[floatA_20s_ease-in-out_infinite]"
          style={{ top: "-10%", right: "-5%" }}
        />
        <FloatingShape
          className="w-[400px] h-[400px] bg-[#3B82F6] animate-[floatB_25s_ease-in-out_infinite]"
          style={{ bottom: "-5%", left: "-10%" }}
        />
        <FloatingShape
          className="w-[300px] h-[300px] bg-[#8B5CF6] animate-[floatC_22s_ease-in-out_infinite]"
          style={{ top: "40%", right: "20%" }}
        />

        {/* Top gradient sweep */}
        <div className="absolute inset-0 bg-gradient-to-b from-swed-orange/[0.08] via-transparent to-transparent" />
      </div>

      {/* Logo & Branding */}
      <div
        className={`relative z-10 flex flex-col items-center pt-16 pb-10 px-4 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {/* Shield icon with glow */}
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-swed-orange/30 rounded-2xl blur-xl animate-[shieldGlow_3s_ease-in-out_infinite]" />
          <div className="relative p-4 bg-gradient-to-br from-swed-orange/20 to-swed-orange/5 rounded-2xl border border-swed-orange/30 backdrop-blur-sm">
            <Shield className="h-10 w-10 text-swed-orange animate-[shieldPulse_3s_ease-in-out_infinite]" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white tracking-tight">
          FraudShield <span className="text-swed-orange">AI</span>
        </h1>
        <p className="text-[#8899AA] mt-2 text-sm max-w-xs text-center">
          Multi-sector fraud detection and prevention platform
        </p>

        {/* Powered by AI badge */}
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-swed-surface/60 border border-swed-border/60 backdrop-blur-sm">
          <Sparkles className="h-3 w-3 text-swed-orange" />
          <span className="text-[10px] text-[#8899AA] font-medium uppercase tracking-wider">
            Powered by AI
          </span>
        </div>
      </div>

      {/* Login form */}
      <div
        className={`flex-1 flex items-start justify-center px-4 relative z-10 transition-all duration-700 delay-150 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="w-full max-w-md">
          {/* Glassmorphism card */}
          <div className="bg-swed-card/70 backdrop-blur-xl border border-swed-border/60 rounded-2xl p-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
            <p className="text-[#8899AA] text-sm mb-6">
              Access your fraud monitoring dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8899AA] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#556677]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@swedbank.se"
                    className="bg-swed-surface/60 border-swed-border/60 text-white placeholder:text-[#556677] h-11 pl-10 rounded-xl focus:border-swed-orange/50 focus:ring-swed-orange/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8899AA] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#556677]" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-swed-surface/60 border-swed-border/60 text-white placeholder:text-[#556677] h-11 pl-10 rounded-xl focus:border-swed-orange/50 focus:ring-swed-orange/20 transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5 animate-slideIn">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {lastRole && !error && (
                <div className="flex items-center gap-2 text-success text-sm bg-success/10 border border-success/20 rounded-xl px-3 py-2.5 animate-slideIn">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  Logging in as {lastRole.replace(/_/g, " ").toLowerCase()}...
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-swed-orange to-[#FF8534] hover:from-swed-orange/90 hover:to-[#FF8534]/90 text-white font-medium rounded-xl shadow-lg shadow-swed-orange/20 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-swed-border to-transparent" />
              <span className="text-[10px] text-[#8899AA] uppercase tracking-[0.15em] font-medium">
                Quick Access Demo
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-swed-border to-transparent" />
            </div>

            <div className="grid gap-3">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account)}
                    disabled={loading}
                    className={`group relative flex items-center gap-4 w-full p-4 bg-gradient-to-r ${account.bgClass} border ${account.borderClass} rounded-xl transition-all duration-200 text-left disabled:opacity-50 hover:shadow-lg hover:shadow-black/10 hover:scale-[1.01] active:scale-[0.99]`}
                  >
                    {/* Icon */}
                    <div
                      className="p-2.5 rounded-xl shrink-0"
                      style={{
                        background: `${account.color}15`,
                        border: `1px solid ${account.color}30`,
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: account.color }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-white">
                          {account.label}
                        </p>
                        <span
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                          style={{
                            color: account.color,
                            background: `${account.color}15`,
                          }}
                        >
                          demo
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8899AA] leading-relaxed">
                        {account.description}
                      </p>
                      <p className="text-[10px] text-[#556677] mt-1 font-mono">
                        {account.name} -- {account.email}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight
                      className="h-4 w-4 text-[#556677] group-hover:translate-x-0.5 transition-transform shrink-0"
                      style={{
                        color: account.color,
                        opacity: 0.5,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-center text-[10px] text-[#556677] mt-8 pb-8">
            Swedbank FraudShield AI -- Multi-Sector Fraud Prevention Platform
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.03); }
          66% { transform: translate(15px, -25px) scale(0.97); }
        }
        @keyframes floatC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -15px) scale(1.04); }
        }
        @keyframes shieldGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes shieldPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
