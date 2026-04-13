"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ───────────────────────────────────────────────────────────── *
 *  CONSTANTS                                                    *
 * ───────────────────────────────────────────────────────────── */

const COLORS = {
  bg: "#1A1A2E",
  teal: "#028090",
  blue: "#1C7293",
  green: "#00C853",
  red: "#CC0000",
  orange: "#FF6100",
  white: "#FFFFFF",
  muted: "#8899AA",
  darkCard: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
};

const SCENE_DURATIONS = [5000, 5000, 6000, 5000, 5000]; // ms per scene
const TOTAL_SCENES = 5;

/* ───────────────────────────────────────────────────────────── *
 *  STYLES (injected as <style> tag)                             *
 * ───────────────────────────────────────────────────────────── */

const globalCSS = `
/* ---- keyframes ---- */

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(60px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleBounce {
  0%   { transform: scale(0); }
  60%  { transform: scale(1.15); }
  80%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
@keyframes drawPath {
  to { stroke-dashoffset: 0; }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes floatUp {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-120px) scale(0.4); }
}
@keyframes waveAnim {
  0%   { d: path("M0,50 Q25,30 50,50 T100,50 T150,50 T200,50"); }
  50%  { d: path("M0,50 Q25,70 50,50 T100,50 T150,50 T200,50"); }
  100% { d: path("M0,50 Q25,30 50,50 T100,50 T150,50 T200,50"); }
}
@keyframes flowRight {
  0%   { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
}
@keyframes dotsBlink {
  0%, 20% { content: '.'; }
  40%     { content: '..'; }
  60%, 100% { content: '...'; }
}
@keyframes barGrow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes gaugeRotate {
  from { stroke-dashoffset: var(--gauge-circumference); }
  to   { stroke-dashoffset: var(--gauge-target); }
}
@keyframes borderPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(2,128,144,0.6); }
  50%      { box-shadow: 0 0 40px 8px rgba(2,128,144,0.25); }
}

/* ---- scene wrappers ---- */

.scene-container {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}
.scene-container.active {
  opacity: 1;
  pointer-events: auto;
}

/* ---- utility ---- */

.anim-fade-in {
  animation: fadeIn 0.6s ease both;
}
.anim-slide-right {
  animation: slideInRight 0.5s ease both;
}
.anim-slide-up {
  animation: slideInUp 0.5s ease both;
}
.anim-scale-bounce {
  animation: scaleBounce 0.7s ease both;
}
.anim-pulse {
  animation: pulse 1.6s ease-in-out infinite;
}
`;

/* ───────────────────────────────────────────────────────────── *
 *  HELPER: animated number                                      *
 * ───────────────────────────────────────────────────────────── */

function useAnimatedNumber(
  target: number,
  duration: number,
  active: boolean,
  delay = 0
) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let start: number | null = null;
    let timeout: ReturnType<typeof setTimeout>;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, active, delay]);

  return value;
}

/* ───────────────────────────────────────────────────────────── *
 *  SCENE 2.2 — Voice AI Detection                              *
 * ───────────────────────────────────────────────────────────── */

function SceneVoiceAI({ active }: { active: boolean }) {
  const riskScore = useAnimatedNumber(94, 2000, active, 1500);

  // Generate waveform path
  const makeWave = (seed: number, amplitude: number) => {
    const points: string[] = [];
    for (let i = 0; i <= 200; i += 2) {
      const y =
        50 +
        Math.sin((i + seed) * 0.08) * amplitude * 0.6 +
        Math.sin((i + seed) * 0.15) * amplitude * 0.3 +
        Math.sin((i + seed) * 0.03) * amplitude * 0.4;
      points.push(`${i},${y.toFixed(1)}`);
    }
    return `M${points.join(" L")}`;
  };

  const greenWave = makeWave(0, 25);
  const redWave = makeWave(42, 30);

  const gaugeCircumference = 2 * Math.PI * 70;
  const gaugeOffset =
    gaugeCircumference - (gaugeCircumference * 0.75 * riskScore) / 100;

  const scoreColor =
    riskScore > 80
      ? COLORS.red
      : riskScore > 50
      ? COLORS.orange
      : COLORS.green;

  return (
    <div
      className={`scene-container ${active ? "active" : ""}`}
      style={{ gap: 28 }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.teal,
          animation: active ? "fadeIn 0.6s ease both" : "none",
        }}
      >
        Voice AI Detection
      </h2>

      {/* Waveforms */}
      <div
        style={{
          display: "flex",
          gap: 48,
          animation: active ? "fadeIn 0.7s ease 0.2s both" : "none",
        }}
      >
        {/* Known voice */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: 13,
              color: COLORS.green,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Known Grandson Voice
          </span>
          <svg
            width={360}
            height={100}
            viewBox="0 0 200 100"
            style={{ marginTop: 8 }}
          >
            <path
              d={greenWave}
              fill="none"
              stroke={COLORS.green}
              strokeWidth={2}
              strokeLinecap="round"
              style={{
                strokeDasharray: 800,
                strokeDashoffset: active ? 0 : 800,
                transition: "stroke-dashoffset 2s ease",
              }}
            />
          </svg>
        </div>

        {/* Incoming caller */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: 13,
              color: COLORS.red,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Incoming Caller
          </span>
          <svg
            width={360}
            height={100}
            viewBox="0 0 200 100"
            style={{ marginTop: 8 }}
          >
            <path
              d={redWave}
              fill="none"
              stroke={COLORS.red}
              strokeWidth={2}
              strokeLinecap="round"
              style={{
                strokeDasharray: 800,
                strokeDashoffset: active ? 0 : 800,
                transition: "stroke-dashoffset 2s ease 0.3s",
              }}
            />
          </svg>
        </div>
      </div>

      {/* Caller ID Analysis panel */}
      <div
        style={{
          background: COLORS.darkCard,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 12,
          padding: "16px 32px",
          display: "flex",
          gap: 32,
          alignItems: "center",
          animation: active ? "slideInUp 0.5s ease 0.8s both" : "none",
        }}
      >
        <span style={{ color: COLORS.muted, fontSize: 14 }}>
          Caller ID Analysis
        </span>
        <span style={{ color: COLORS.white, fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: 16 }}>
          +371 2X XXX XXX
        </span>
        <span
          style={{
            background: COLORS.red,
            color: COLORS.white,
            padding: "4px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          SPOOFED
        </span>
      </div>

      {/* Risk gauge */}
      <div
        style={{
          position: "relative",
          width: 180,
          height: 120,
          animation: active ? "fadeIn 0.6s ease 1.2s both" : "none",
        }}
      >
        <svg width={180} height={120} viewBox="0 0 180 120">
          {/* Background arc */}
          <circle
            cx={90}
            cy={90}
            r={70}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={10}
            strokeDasharray={`${gaugeCircumference * 0.75} ${gaugeCircumference * 0.25}`}
            strokeDashoffset={gaugeCircumference * 0.25}
            strokeLinecap="round"
            transform="rotate(135 90 90)"
          />
          {/* Filled arc */}
          <circle
            cx={90}
            cy={90}
            r={70}
            fill="none"
            stroke={scoreColor}
            strokeWidth={10}
            strokeDasharray={`${gaugeCircumference * 0.75} ${gaugeCircumference * 0.25}`}
            strokeDashoffset={gaugeOffset}
            strokeLinecap="round"
            transform="rotate(135 90 90)"
            style={{ transition: "stroke-dashoffset 2s ease, stroke 0.5s" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 700, color: scoreColor }}>
            {riskScore}
          </div>
          <div style={{ fontSize: 11, color: COLORS.muted }}>Risk Score</div>
        </div>
      </div>

      {/* Warning badge */}
      <div
        style={{
          background: "rgba(204,0,0,0.12)",
          border: `1px solid ${COLORS.red}`,
          borderRadius: 10,
          padding: "14px 28px",
          fontSize: 18,
          fontWeight: 600,
          color: COLORS.red,
          animation: active
            ? "scaleBounce 0.6s ease 2.5s both, pulse 1.6s ease-in-out 3.1s infinite"
            : "none",
        }}
      >
        SPOOFED NUMBER DETECTED — 94% Confidence
      </div>

      {/* Bottom text */}
      <p
        style={{
          color: COLORS.muted,
          fontSize: 14,
          animation: active ? "fadeIn 0.5s ease 3s both" : "none",
        }}
      >
        Voice AI: Caller ID spoofing detected
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── *
 *  SCENE 2.3 — Transaction AI Flags Pattern                     *
 * ───────────────────────────────────────────────────────────── */

function SceneTransactionAI({ active }: { active: boolean }) {
  const riskScore = useAnimatedNumber(91, 2200, active, 2000);

  const monthLabels = [
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
  ];
  const values = [80, 120, 65, 150, 95, 180, 110, 60, 200, 140, 90, 2000];

  const scoreColor =
    riskScore > 80
      ? COLORS.red
      : riskScore > 60
      ? COLORS.orange
      : riskScore > 30
      ? "#FFD600"
      : COLORS.green;

  const featureCards = [
    { label: "New Recipient", delay: 1.8 },
    { label: "Unusual Amount (10x average)", delay: 2.1 },
    { label: "Urgent Timing Pattern", delay: 2.4 },
  ];

  return (
    <div className={`scene-container ${active ? "active" : ""}`}>
      {/* Title */}
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.teal,
          marginBottom: 20,
          animation: active ? "fadeIn 0.6s ease both" : "none",
        }}
      >
        Transaction AI — Behavioral Analysis
      </h2>

      <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
        {/* Bar chart */}
        <div>
          <p
            style={{
              color: COLORS.white,
              fontSize: 15,
              marginBottom: 12,
              animation: active ? "fadeIn 0.5s ease 0.2s both" : "none",
            }}
          >
            Janis Transaction History
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              height: 220,
              padding: "0 4px",
            }}
          >
            {values.map((v, i) => {
              const maxVal = 2000;
              const h = (v / maxVal) * 200;
              const isLast = i === values.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: isLast ? COLORS.red : COLORS.muted,
                      fontWeight: isLast ? 700 : 400,
                      opacity: active ? 1 : 0,
                      transition: `opacity 0.3s ease ${0.3 + i * 0.12}s`,
                    }}
                  >
                    {isLast ? "€2,000" : `€${v}`}
                  </span>
                  <div
                    style={{
                      width: 32,
                      height: h,
                      borderRadius: "4px 4px 0 0",
                      background: isLast
                        ? `linear-gradient(to top, ${COLORS.red}, ${COLORS.orange})`
                        : `linear-gradient(to top, ${COLORS.blue}, ${COLORS.teal})`,
                      transformOrigin: "bottom",
                      transform: active ? "scaleY(1)" : "scaleY(0)",
                      transition: `transform 0.5s cubic-bezier(.34,1.56,.64,1) ${
                        0.3 + i * 0.12
                      }s`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: COLORS.muted,
                      opacity: active ? 1 : 0,
                      transition: `opacity 0.3s ease ${0.3 + i * 0.12}s`,
                    }}
                  >
                    {monthLabels[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {featureCards.map((c, i) => (
            <div
              key={i}
              style={{
                background: COLORS.darkCard,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 10,
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                animation: active
                  ? `slideInRight 0.45s ease ${c.delay}s both`
                  : "none",
              }}
            >
              <span style={{ fontSize: 20 }}>&#9888;</span>
              <span style={{ color: COLORS.white, fontSize: 14 }}>
                {c.label}
              </span>
            </div>
          ))}
          <div
            style={{
              background: "rgba(2,128,144,0.12)",
              border: `1px solid ${COLORS.teal}`,
              borderRadius: 10,
              padding: "10px 20px",
              textAlign: "center",
              color: COLORS.teal,
              fontSize: 13,
              fontWeight: 600,
              animation: active
                ? "slideInRight 0.45s ease 2.7s both"
                : "none",
            }}
          >
            47 Features Analyzed
          </div>
        </div>
      </div>

      {/* Risk score counter */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          animation: active ? "fadeIn 0.5s ease 2s both" : "none",
        }}
      >
        <span style={{ fontSize: 48, fontWeight: 700, color: scoreColor }}>
          {riskScore}
        </span>
        <span style={{ fontSize: 22, color: COLORS.muted }}>/100</span>
      </div>

      {/* Alert badge */}
      <div
        style={{
          marginTop: 16,
          background: "rgba(204,0,0,0.12)",
          border: `1px solid ${COLORS.red}`,
          borderRadius: 10,
          padding: "14px 28px",
          fontSize: 18,
          fontWeight: 600,
          color: COLORS.red,
          animation: active
            ? "scaleBounce 0.6s ease 3.2s both, pulse 1.6s ease-in-out 3.8s infinite"
            : "none",
        }}
      >
        ANOMALOUS TRANSFER — Risk Score: 91/100
      </div>

      <p
        style={{
          color: COLORS.muted,
          fontSize: 14,
          marginTop: 12,
          animation: active ? "fadeIn 0.5s ease 3.5s both" : "none",
        }}
      >
        Transaction AI: Unusual pattern flagged
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── *
 *  SCENE 2.4 — Transaction Paused + Chain of Responsibility     *
 * ───────────────────────────────────────────────────────────── */

function SceneTransactionPaused({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0); // 0-3: nodes lighting, 4: denied

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const nodes = [
    { icon: "\uD83C\uDFE6", label: "Bank", color: COLORS.orange, step: 1 },
    { icon: "\uD83D\uDCF1", label: "Telecom", color: COLORS.blue, step: 2 },
    { icon: "\u2696\uFE0F", label: "Authority", color: "#9C27B0", step: 3 },
  ];

  return (
    <div className={`scene-container ${active ? "active" : ""}`}>
      {/* PAUSED overlay */}
      <div
        style={{
          border: `2px solid ${COLORS.teal}`,
          borderRadius: 16,
          padding: "28px 56px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          animation: active
            ? "scaleBounce 0.6s ease both, borderPulse 2s ease-in-out infinite"
            : "none",
          background: "rgba(2,128,144,0.08)",
        }}
      >
        {/* Shield icon */}
        <svg
          width={48}
          height={48}
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.teal}
          strokeWidth={1.8}
        >
          <path d="M12 2l8 4v6c0 5.25-3.4 10-8 12-4.6-2-8-6.75-8-12V6l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.teal,
            letterSpacing: 2,
          }}
        >
          TRANSACTION PAUSED
        </span>
      </div>

      {/* Chain of responsibility */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginTop: 48,
          animation: active ? "fadeIn 0.5s ease 0.5s both" : "none",
        }}
      >
        {nodes.map((n, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 0 }}
          >
            {/* Node */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  border: `3px solid ${
                    phase >= n.step ? n.color : "rgba(255,255,255,0.1)"
                  }`,
                  background:
                    phase >= n.step
                      ? `${n.color}22`
                      : "rgba(255,255,255,0.02)",
                  transition:
                    "border-color 0.5s ease, background 0.5s ease, box-shadow 0.5s ease",
                  boxShadow:
                    phase >= n.step ? `0 0 24px ${n.color}44` : "none",
                }}
              >
                {n.icon}
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color:
                    phase >= n.step ? n.color : "rgba(255,255,255,0.3)",
                  transition: "color 0.5s ease",
                }}
              >
                {n.label}
              </span>
            </div>

            {/* Arrow connector */}
            {i < nodes.length - 1 && (
              <svg
                width={80}
                height={20}
                viewBox="0 0 80 20"
                style={{ margin: "0 8px", marginBottom: 28 }}
              >
                <line
                  x1={0}
                  y1={10}
                  x2={65}
                  y2={10}
                  stroke={
                    phase > n.step
                      ? COLORS.teal
                      : "rgba(255,255,255,0.15)"
                  }
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  style={{
                    animation:
                      phase > n.step
                        ? "flowRight 0.5s linear infinite"
                        : "none",
                  }}
                />
                <polygon
                  points="65,4 75,10 65,16"
                  fill={
                    phase > n.step
                      ? COLORS.teal
                      : "rgba(255,255,255,0.15)"
                  }
                  style={{ transition: "fill 0.5s ease" }}
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Status line */}
      <div
        style={{
          marginTop: 40,
          fontSize: 18,
          fontWeight: 500,
          minHeight: 30,
          animation: active ? "fadeIn 0.5s ease 1.5s both" : "none",
        }}
      >
        {phase < 4 ? (
          <span style={{ color: COLORS.muted }}>
            Awaiting customer confirmation
            <span className="anim-pulse">...</span>
          </span>
        ) : (
          <span
            style={{
              color: COLORS.red,
              animation: "scaleBounce 0.5s ease both",
              display: "inline-block",
            }}
          >
            CUSTOMER DENIED — Transaction Cancelled
          </span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── *
 *  SCENE 2.5 — Fraud Blocked                                   *
 * ───────────────────────────────────────────────────────────── */

function SceneFraudBlocked({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<
    { id: number; x: number; delay: number; dur: number }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    const p = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 300 - 150,
      delay: Math.random() * 3,
      dur: 2 + Math.random() * 2,
    }));
    setParticles(p);
  }, [active]);

  return (
    <div className={`scene-container ${active ? "active" : ""}`}>
      {/* Particles */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          pointerEvents: "none",
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `calc(50% + ${p.x}px)`,
              bottom: 0,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: COLORS.green,
              opacity: 0,
              animation: active
                ? `floatUp ${p.dur}s ease ${p.delay}s infinite`
                : "none",
            }}
          />
        ))}
      </div>

      {/* Shield */}
      <div style={{ animation: active ? "scaleBounce 0.7s ease 0.2s both" : "none" }}>
        <svg width={160} height={180} viewBox="0 0 24 28" fill="none">
          <path
            d="M12 1l10 5v7c0 6.075-4 11.5-10 14C6 24.5 2 19.075 2 13V6l10-5z"
            fill={COLORS.green}
            fillOpacity={0.15}
            stroke={COLORS.green}
            strokeWidth={0.8}
          />
          <path
            d="M8 14l3 3 5-6"
            stroke={COLORS.green}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 20,
              strokeDashoffset: active ? 0 : 20,
              transition: "stroke-dashoffset 0.6s ease 0.7s",
            }}
          />
        </svg>
      </div>

      {/* Text */}
      <h2
        style={{
          fontSize: 44,
          fontWeight: 700,
          color: COLORS.green,
          marginTop: 16,
          animation: active ? "slideInUp 0.5s ease 0.6s both" : "none",
        }}
      >
        FRAUD BLOCKED
      </h2>
      <p
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: COLORS.white,
          marginTop: 8,
          animation: active ? "slideInUp 0.5s ease 0.9s both" : "none",
        }}
      >
        &euro;2,000 SAVED
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── *
 *  SCENE 3 — Closing Card                                       *
 * ───────────────────────────────────────────────────────────── */

function SceneClosing({ active }: { active: boolean }) {
  const stats = [
    { value: "96.2%", label: "Detection Accuracy", delay: 2.0 },
    { value: "<50ms", label: "Response Time", delay: 2.3 },
    { value: "3", label: "Sectors United", delay: 2.6 },
  ];

  return (
    <div className={`scene-container ${active ? "active" : ""}`}>
      {/* Shield logo with circuit pattern */}
      <div style={{ animation: active ? "fadeIn 0.8s ease both" : "none" }}>
        <svg width={100} height={110} viewBox="0 0 24 28" fill="none">
          <path
            d="M12 1l10 5v7c0 6.075-4 11.5-10 14C6 24.5 2 19.075 2 13V6l10-5z"
            fill="none"
            stroke={COLORS.teal}
            strokeWidth={0.6}
            style={{
              strokeDasharray: 80,
              strokeDashoffset: active ? 0 : 80,
              transition: "stroke-dashoffset 1.5s ease",
            }}
          />
          {/* Circuit lines inside shield */}
          <path
            d="M8 10h2v4h4v-2h2M10 14v2M14 12h-2v-2"
            stroke={COLORS.teal}
            strokeWidth={0.4}
            strokeLinecap="round"
            opacity={0.5}
            style={{
              strokeDasharray: 40,
              strokeDashoffset: active ? 0 : 40,
              transition: "stroke-dashoffset 1.8s ease 0.3s",
            }}
          />
          {/* Circuit dots */}
          <circle cx={8} cy={10} r={0.5} fill={COLORS.teal} opacity={0.6} />
          <circle cx={16} cy={12} r={0.5} fill={COLORS.teal} opacity={0.6} />
          <circle cx={10} cy={16} r={0.5} fill={COLORS.teal} opacity={0.6} />
        </svg>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: COLORS.teal,
          marginTop: 20,
          animation: active ? "fadeIn 0.6s ease 0.8s both" : "none",
        }}
      >
        Swedbank FraudShield AI
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 20,
          color: COLORS.white,
          marginTop: 8,
          animation: active ? "fadeIn 0.5s ease 1.2s both" : "none",
        }}
      >
        AI-Powered Cross-Sector Fraud Detection
      </p>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 56,
          marginTop: 36,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              animation: active
                ? `slideInUp 0.5s ease ${s.delay}s both`
                : "none",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: COLORS.teal,
              }}
            >
              {s.value}
            </div>
            <div
              style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: 16,
          fontStyle: "italic",
          color: "rgba(255,255,255,0.45)",
          marginTop: 36,
          animation: active ? "fadeIn 0.5s ease 3s both" : "none",
        }}
      >
        The future of fraud prevention is collaborative.
      </p>

      {/* Footer */}
      <p
        style={{
          fontSize: 13,
          color: COLORS.muted,
          marginTop: 20,
          animation: active ? "fadeIn 0.5s ease 3.5s both" : "none",
        }}
      >
        Riga Technical University | Hackathon 2026
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── *
 *  MAIN DEMO PAGE                                               *
 * ───────────────────────────────────────────────────────────── */

export default function DemoPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => {
    setCurrentScene((s) => Math.min(s + 1, TOTAL_SCENES - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentScene((s) => Math.max(s - 1, 0));
  }, []);

  // Auto-play
  useEffect(() => {
    if (!autoPlaying) {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      return;
    }

    const scheduleNext = (scene: number) => {
      if (scene >= TOTAL_SCENES - 1) {
        setAutoPlaying(false);
        return;
      }
      autoTimerRef.current = setTimeout(() => {
        setCurrentScene(scene + 1);
        scheduleNext(scene + 1);
      }, SCENE_DURATIONS[scene]);
    };

    scheduleNext(currentScene);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
    // only re-run when autoPlaying toggles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlaying]);

  const startAutoPlay = useCallback(() => {
    setCurrentScene(0);
    setTimeout(() => setAutoPlaying(true), 100);
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        setAutoPlaying(false);
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setAutoPlaying(false);
        goPrev();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        startAutoPlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, startAutoPlay]);

  const sceneLabels = [
    "Voice AI Detection",
    "Transaction AI",
    "Transaction Paused",
    "Fraud Blocked",
    "Closing",
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          background: COLORS.bg,
          overflow: "hidden",
          fontFamily: "var(--font-ibm-plex-sans), sans-serif",
          color: COLORS.white,
        }}
      >
        {/* Scenes */}
        <SceneVoiceAI active={currentScene === 0} />
        <SceneTransactionAI active={currentScene === 1} />
        <SceneTransactionPaused active={currentScene === 2} />
        <SceneFraudBlocked active={currentScene === 3} />
        <SceneClosing active={currentScene === 4} />

        {/* Scene indicator */}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 100,
          }}
        >
          {/* Scene dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {sceneLabels.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setAutoPlaying(false);
                  setCurrentScene(i);
                }}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  background:
                    i === currentScene
                      ? COLORS.teal
                      : "rgba(255,255,255,0.2)",
                  transition: "background 0.3s",
                }}
                title={sceneLabels[i]}
              />
            ))}
          </div>
          <span style={{ fontSize: 12, color: COLORS.muted }}>
            Scene {currentScene + 1}/{TOTAL_SCENES}
          </span>
          {autoPlaying && (
            <span
              style={{
                fontSize: 10,
                color: COLORS.teal,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Auto
            </span>
          )}
        </div>

        {/* Controls hint */}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 24,
            fontSize: 11,
            color: "rgba(255,255,255,0.2)",
            zIndex: 100,
          }}
        >
          Space/Arrow: navigate &middot; A: auto-play
        </div>
      </div>
    </>
  );
}
