"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Shield,
  Building2,
  Radio,
  Scale,
  Zap,
  Brain,
  Eye,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Lock,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animated counter hook – counts up when element is in view         */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000, suffix = "") {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return { ref, display: `${value}${suffix}` };
}

/* ------------------------------------------------------------------ */
/*  Intersection-observer fade-in hook                                */
/* ------------------------------------------------------------------ */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, className: visible ? "landing-fade-in landing-visible" : "landing-fade-in" };
}

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                               */
/* ================================================================== */
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  /* ---------- Auth redirect (existing logic) ---------- */
  useEffect(() => {
    if (status === "loading") return;
    if (!session) return; // not logged in → show landing

    const role = session.user.role;
    if (role === "BANK_ANALYST") router.replace("/bank");
    else if (role === "TELECOM_OPERATOR") router.replace("/telecom");
    else if (role === "AUTHORITY_OFFICER") router.replace("/authority");
    else router.replace("/bank");
  }, [session, status, router]);

  /* While checking auth, show a brief loader */
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-swed-dark">
        <div className="h-8 w-8 border-2 border-swed-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* If authenticated, show loader while redirect fires */
  if (session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-swed-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-swed-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8899AA] text-sm">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  /* ==================== LANDING PAGE ==================== */
  return (
    <div className="min-h-screen bg-swed-dark text-white overflow-x-hidden scroll-smooth">
      {/* ---------- Inline styles for CSS-only animations ---------- */}
      <style jsx global>{`
        /* ---- grid background ---- */
        .landing-grid {
          background-image:
            linear-gradient(rgba(255,97,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,97,0,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ---- floating particles (CSS only) ---- */
        .landing-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,97,0,0.35) 0%, transparent 70%);
          animation: particleFloat 20s ease-in-out infinite;
          pointer-events: none;
        }
        .landing-particle:nth-child(2) { animation-delay: -5s; animation-duration: 25s; }
        .landing-particle:nth-child(3) { animation-delay: -10s; animation-duration: 18s; }
        .landing-particle:nth-child(4) { animation-delay: -3s; animation-duration: 22s; }
        .landing-particle:nth-child(5) { animation-delay: -8s; animation-duration: 30s; }
        .landing-particle:nth-child(6) { animation-delay: -15s; animation-duration: 16s; }

        @keyframes particleFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(100px, -150px) scale(1.2); opacity: 0.5; }
          50% { transform: translate(-80px, -250px) scale(0.8); opacity: 0.2; }
          75% { transform: translate(120px, -100px) scale(1.1); opacity: 0.4; }
        }

        /* ---- hero gradient orbs ---- */
        .landing-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        /* ---- fade-in on scroll ---- */
        .landing-fade-in {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .landing-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ---- glass card ---- */
        .glass-card {
          background: rgba(26, 35, 50, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(42, 53, 69, 0.5);
          transition: all 0.4s ease;
        }
        .glass-card:hover {
          border-color: rgba(255, 97, 0, 0.4);
          box-shadow: 0 0 30px rgba(255, 97, 0, 0.1), inset 0 0 30px rgba(255, 97, 0, 0.03);
          transform: translateY(-4px);
        }

        /* ---- pulsing glow ring ---- */
        .glow-ring {
          box-shadow: 0 0 0 0 rgba(255,97,0,0.3);
          animation: glowPulse 3s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,97,0,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(255,97,0,0); }
        }

        /* ---- flowing gradient line ---- */
        .gradient-line {
          background: linear-gradient(90deg, transparent, #FF6100, transparent);
          animation: flowLine 3s ease-in-out infinite;
        }
        @keyframes flowLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* ---- dashboard mockup scan line ---- */
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #FF6100, transparent);
          animation: scanMove 4s linear infinite;
        }
        @keyframes scanMove {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* ---- typing cursor ---- */
        .typing-cursor {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }

        /* ---- staggered children ---- */
        .stagger-children > *:nth-child(1) { transition-delay: 0.1s; }
        .stagger-children > *:nth-child(2) { transition-delay: 0.2s; }
        .stagger-children > *:nth-child(3) { transition-delay: 0.3s; }
        .stagger-children > *:nth-child(4) { transition-delay: 0.4s; }

        /* ---- flow arrow animation ---- */
        .flow-arrow {
          animation: flowArrow 2s ease-in-out infinite;
        }
        @keyframes flowArrow {
          0%, 100% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(6px); opacity: 1; }
        }

        /* ---- nav blur ---- */
        .nav-blur {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* smooth scroll for the whole page */
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ================================================================ */}
      {/*  NAVIGATION                                                      */}
      {/* ================================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur bg-swed-dark/70 border-b border-swed-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-swed-orange to-orange-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Fraud<span className="text-swed-orange">Shield</span> AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#8899AA]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Performance</a>
            <a href="#ai" className="hover:text-white transition-colors">AI Engine</a>
          </div>
          <a
            href="/login"
            className="px-5 py-2 rounded-lg bg-swed-orange hover:bg-orange-600 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-swed-orange/20"
          >
            Launch Dashboard
          </a>
        </div>
      </nav>

      {/* ================================================================ */}
      {/*  HERO SECTION                                                    */}
      {/* ================================================================ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 landing-grid overflow-hidden">
        {/* Background orbs */}
        <div className="landing-orb w-[600px] h-[600px] bg-swed-orange/10 top-[-200px] right-[-200px]" />
        <div className="landing-orb w-[500px] h-[500px] bg-blue-500/5 bottom-[-100px] left-[-150px]" />

        {/* Particles */}
        <div className="landing-particle w-3 h-3 top-[20%] left-[10%]" />
        <div className="landing-particle w-2 h-2 top-[40%] left-[80%]" />
        <div className="landing-particle w-4 h-4 top-[60%] left-[20%]" />
        <div className="landing-particle w-2 h-2 top-[30%] left-[60%]" />
        <div className="landing-particle w-3 h-3 top-[70%] left-[70%]" />
        <div className="landing-particle w-2 h-2 top-[50%] left-[40%]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-swed-orange/30 bg-swed-orange/5 text-swed-orange text-xs font-medium tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-swed-orange animate-pulse" />
              Multi-Sector Intelligence Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-[#8899AA] bg-clip-text text-transparent">
                Fraud
              </span>
              <span className="bg-gradient-to-r from-swed-orange to-orange-400 bg-clip-text text-transparent">
                Shield
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-white to-[#8899AA] bg-clip-text text-transparent">
                AI
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#8899AA] leading-relaxed max-w-lg">
              Real-time fraud detection powered by explainable AI.
              Protecting <span className="text-white font-medium">banking</span>,{" "}
              <span className="text-white font-medium">telecom</span>, and{" "}
              <span className="text-white font-medium">government</span> sectors
              with unified intelligence.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/login"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-swed-orange to-orange-600 text-white font-semibold text-base transition-all hover:shadow-xl hover:shadow-swed-orange/25 hover:scale-[1.02]"
              >
                Launch Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-swed-border text-[#8899AA] hover:text-white hover:border-swed-orange/40 font-medium text-base transition-all"
              >
                View Demo
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            {/* Mini trust badges */}
            <div className="flex items-center gap-6 pt-4 text-xs text-[#556677]">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> End-to-End Encrypted</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Sub-50ms Latency</span>
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Explainable AI</span>
            </div>
          </div>

          {/* Right – Dashboard Mockup */}
          <div className="relative">
            {/* Glow behind */}
            <div className="absolute inset-0 bg-gradient-to-br from-swed-orange/10 via-transparent to-blue-500/5 rounded-2xl blur-3xl" />

            <div className="relative glass-card rounded-2xl p-1 shadow-2xl shadow-black/40">
              <div className="bg-swed-dark/80 rounded-xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-swed-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 text-center text-[10px] text-[#556677] font-mono">
                    fraudshield.swedbank.internal
                  </div>
                </div>

                {/* Mock dashboard content */}
                <div className="p-5 space-y-4 relative">
                  <div className="scan-line" />

                  {/* Top stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Transactions", value: "1,247,893", trend: "+12.4%", color: "text-green-400" },
                      { label: "Alerts Today", value: "342", trend: "+8.2%", color: "text-swed-orange" },
                      { label: "Blocked", value: "23", trend: "-5.1%", color: "text-red-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-swed-surface/60 rounded-lg p-3">
                        <div className="text-[10px] text-[#556677] uppercase tracking-wider">{s.label}</div>
                        <div className="text-lg font-semibold font-mono mt-0.5">{s.value}</div>
                        <div className={`text-[10px] ${s.color} font-mono`}>{s.trend}</div>
                      </div>
                    ))}
                  </div>

                  {/* Fake chart area */}
                  <div className="bg-swed-surface/40 rounded-lg p-4 h-36 flex items-end gap-1">
                    {[40,65,45,80,55,90,70,85,60,95,75,88,50,72,92,68,78,85,62,94].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all"
                        style={{
                          height: `${h}%`,
                          background: h > 80
                            ? "linear-gradient(to top, #FF6100, #FF8A40)"
                            : "linear-gradient(to top, rgba(255,97,0,0.2), rgba(255,97,0,0.4))",
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Fake transaction rows */}
                  <div className="space-y-2">
                    {[
                      { id: "TXN-8842", amount: "$12,450", risk: "HIGH", riskColor: "bg-red-500" },
                      { id: "TXN-8843", amount: "$890", risk: "LOW", riskColor: "bg-green-500" },
                      { id: "TXN-8844", amount: "$34,200", risk: "CRITICAL", riskColor: "bg-red-600" },
                    ].map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between bg-swed-surface/30 rounded-lg px-3 py-2 text-xs">
                        <span className="font-mono text-[#8899AA]">{tx.id}</span>
                        <span className="font-mono text-white">{tx.amount}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white ${tx.riskColor}`}>
                          {tx.risk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#556677]">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ================================================================ */}
      {/*  FEATURES / ROLES SECTION                                        */}
      {/* ================================================================ */}
      <FeatureSection />

      {/* ================================================================ */}
      {/*  STATS SECTION                                                   */}
      {/* ================================================================ */}
      <StatsSection />

      {/* ================================================================ */}
      {/*  AI CAPABILITIES SECTION                                         */}
      {/* ================================================================ */}
      <AISection />

      {/* ================================================================ */}
      {/*  CTA SECTION                                                     */}
      {/* ================================================================ */}
      <CTASection />

      {/* ================================================================ */}
      {/*  FOOTER                                                          */}
      {/* ================================================================ */}
      <Footer />
    </div>
  );
}

/* ================================================================== */
/*  FEATURE CARDS (Roles)                                             */
/* ================================================================== */
function FeatureSection() {
  const fade = useFadeIn();

  const roles = [
    {
      icon: Building2,
      title: "Bank Analyst",
      description:
        "Monitor transaction flows, detect anomalous patterns, and investigate suspicious activity across financial networks with AI-powered risk scoring.",
      features: ["Transaction monitoring", "Risk scoring", "Pattern analysis"],
      accentColor: "#FF6100",
    },
    {
      icon: Radio,
      title: "Telecom Operator",
      description:
        "Detect SIM-swap fraud, subscription abuse, and identity theft in real-time across telecommunications infrastructure with cross-sector intelligence.",
      features: ["SIM-swap detection", "Subscription fraud", "Identity verification"],
      accentColor: "#0096FF",
    },
    {
      icon: Scale,
      title: "Authority Officer",
      description:
        "Coordinate cross-sector investigations, access unified fraud intelligence, and manage regulatory compliance with full audit trails.",
      features: ["Cross-sector view", "Investigation tools", "Compliance reports"],
      accentColor: "#00C48C",
    },
  ];

  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-swed-surface/20 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div {...fade} className={`text-center mb-16 ${fade.className}`}>
          <span className="text-swed-orange text-sm font-semibold tracking-widest uppercase">
            Role-Based Access
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
            Three Sectors.{" "}
            <span className="bg-gradient-to-r from-swed-orange to-orange-400 bg-clip-text text-transparent">
              One Platform.
            </span>
          </h2>
          <p className="text-[#8899AA] mt-4 max-w-2xl mx-auto text-lg">
            Each role gets a tailored dashboard with sector-specific tools, all powered by the same unified AI engine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, i) => (
            <RoleCard key={role.title} role={role} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RoleCard({
  role,
  index,
}: {
  role: {
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    title: string;
    description: string;
    features: string[];
    accentColor: string;
  };
  index: number;
}) {
  const fade = useFadeIn();
  const Icon = role.icon;

  return (
    <div
      {...fade}
      className={`glass-card rounded-2xl p-8 flex flex-col ${fade.className}`}
      style={{ transitionDelay: `${index * 0.15}s` }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
        style={{ background: `${role.accentColor}15`, border: `1px solid ${role.accentColor}30` }}
      >
        <Icon className="w-7 h-7" style={{ color: role.accentColor }} />
      </div>
      <h3 className="text-xl font-semibold mb-3">{role.title}</h3>
      <p className="text-[#8899AA] text-sm leading-relaxed mb-6 flex-1">{role.description}</p>
      <div className="space-y-2">
        {role.features.map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs text-[#8899AA]">
            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STATS SECTION                                                     */
/* ================================================================== */
function StatsSection() {
  const fade = useFadeIn();

  const stats = [
    { end: 99.7, suffix: "%", label: "Detection Rate", icon: Shield, description: "Industry-leading accuracy" },
    { end: 50, suffix: "ms", label: "Response Time", prefix: "<", icon: Zap, description: "Real-time processing" },
    { end: 3, suffix: "", label: "Sector Coverage", icon: Network, description: "Bank, Telecom, Authority" },
    { end: 24, suffix: "/7", label: "Monitoring", icon: Activity, description: "Non-stop surveillance" },
  ];

  return (
    <section id="stats" className="py-32 relative">
      <div className="relative max-w-7xl mx-auto px-6">
        <div {...fade} className={`text-center mb-16 ${fade.className}`}>
          <span className="text-swed-orange text-sm font-semibold tracking-widest uppercase">
            Performance
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
            Built for{" "}
            <span className="bg-gradient-to-r from-swed-orange to-orange-400 bg-clip-text text-transparent">
              Scale
            </span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  index,
}: {
  stat: {
    end: number;
    suffix: string;
    label: string;
    prefix?: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  };
  index: number;
}) {
  const fade = useFadeIn();
  const counter = useCountUp(stat.end, 2000, stat.suffix);
  const Icon = stat.icon;

  return (
    <div
      {...fade}
      className={`glass-card rounded-2xl p-8 text-center ${fade.className}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="w-12 h-12 rounded-xl bg-swed-orange/10 border border-swed-orange/20 flex items-center justify-center mx-auto mb-5">
        <Icon className="w-6 h-6 text-swed-orange" />
      </div>
      <div className="text-4xl font-bold font-mono text-white mb-1">
        <span ref={counter.ref}>
          {stat.prefix || ""}{counter.display}
        </span>
      </div>
      <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
      <div className="text-xs text-[#556677]">{stat.description}</div>
    </div>
  );
}

/* ================================================================== */
/*  AI CAPABILITIES SECTION                                           */
/* ================================================================== */
function AISection() {
  const fade = useFadeIn();

  const capabilities = [
    {
      icon: Brain,
      title: "Explainable AI",
      description: "Every decision comes with human-readable explanations. Understand why a transaction was flagged, not just that it was.",
    },
    {
      icon: BarChart3,
      title: "Bias Monitoring",
      description: "Continuous fairness audits ensure equitable treatment across demographics, geographies, and customer segments.",
    },
    {
      icon: Network,
      title: "Cross-Sector Intelligence",
      description: "Fraud patterns detected in banking automatically enhance telecom and authority models, creating a unified defense network.",
    },
  ];

  const flowSteps = [
    { label: "Transaction", icon: Activity, color: "#8899AA" },
    { label: "AI Analysis", icon: Brain, color: "#FF6100" },
    { label: "Risk Score", icon: AlertTriangle, color: "#FFBE0B" },
    { label: "Alert", icon: Zap, color: "#FF4757" },
    { label: "Resolution", icon: CheckCircle, color: "#00C48C" },
  ];

  return (
    <section id="ai" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-swed-surface/20 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div {...fade} className={`text-center mb-16 ${fade.className}`}>
          <span className="text-swed-orange text-sm font-semibold tracking-widest uppercase">
            AI Engine
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
            Intelligent.{" "}
            <span className="bg-gradient-to-r from-swed-orange to-orange-400 bg-clip-text text-transparent">
              Explainable.
            </span>{" "}
            Fair.
          </h2>
        </div>

        {/* AI Pipeline Flow */}
        <FlowDiagram steps={flowSteps} />

        {/* Capability cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return <CapabilityCard key={cap.title} cap={cap} Icon={Icon} index={i} />;
          })}
        </div>
      </div>
    </section>
  );
}

function CapabilityCard({
  cap,
  Icon,
  index,
}: {
  cap: { title: string; description: string };
  Icon: React.ComponentType<{ className?: string }>;
  index: number;
}) {
  const fade = useFadeIn();
  return (
    <div
      {...fade}
      className={`glass-card rounded-2xl p-8 ${fade.className}`}
      style={{ transitionDelay: `${index * 0.15}s` }}
    >
      <div className="w-14 h-14 rounded-xl bg-swed-orange/10 border border-swed-orange/20 flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-swed-orange" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{cap.title}</h3>
      <p className="text-[#8899AA] text-sm leading-relaxed">{cap.description}</p>
    </div>
  );
}

function FlowDiagram({
  steps,
}: {
  steps: {
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
  }[];
}) {
  const fade = useFadeIn();

  return (
    <div {...fade} className={`${fade.className}`}>
      <div className="glass-card rounded-2xl p-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border"
                    style={{
                      background: `${step.color}10`,
                      borderColor: `${step.color}30`,
                    }}
                  >
                    <Icon className="w-8 h-8 sm:w-9 sm:h-9" style={{ color: step.color }} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#8899AA]">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:flex items-center mx-4 mb-6">
                    <div className="w-8 h-px bg-swed-border" />
                    <ArrowRight className="w-4 h-4 text-swed-orange flow-arrow" />
                    <div className="w-8 h-px bg-swed-border" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CTA SECTION                                                       */
/* ================================================================== */
function CTASection() {
  const fade = useFadeIn();

  return (
    <section className="py-32 relative">
      <div {...fade} className={`relative max-w-4xl mx-auto px-6 text-center ${fade.className}`}>
        <div className="glass-card rounded-3xl p-12 sm:p-16 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 overflow-hidden rounded-full">
            <div className="gradient-line w-full h-full" />
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-swed-orange to-orange-600 flex items-center justify-center mx-auto mb-8 glow-ring">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ready to Protect Your Sector?
          </h2>
          <p className="text-[#8899AA] max-w-lg mx-auto mb-10 text-lg">
            Join the multi-sector fraud defense network. Real-time detection, explainable AI, and unified intelligence across banking, telecom, and government.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/login"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-swed-orange to-orange-600 text-white font-semibold transition-all hover:shadow-xl hover:shadow-swed-orange/25 hover:scale-[1.02]"
            >
              Launch Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-swed-border text-[#8899AA] hover:text-white hover:border-swed-orange/40 font-medium transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FOOTER                                                            */
/* ================================================================== */
function Footer() {
  return (
    <footer className="border-t border-swed-border/50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-swed-orange to-orange-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold">
              Fraud<span className="text-swed-orange">Shield</span> AI
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#556677]">
            <span>Multi-Sector Fraud Detection Platform</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Powered by Swedbank
            </span>
          </div>
          <div className="text-xs text-[#3A4555]">
            &copy; {new Date().getFullYear()} Swedbank. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
