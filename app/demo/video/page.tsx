"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Timeline config ───────────────────────────────────────────────────────────
const TOTAL_DURATION = 150;

interface SceneDef {
  id: string;
  start: number;
  end: number;
}

const SCENES: SceneDef[] = [
  { id: "1.0",    start: 0,   end: 6 },
  { id: "1.1",    start: 6,   end: 12 },
  { id: "1.2",    start: 12,  end: 19 },
  { id: "1.2b",   start: 19,  end: 23 },
  { id: "1.3",    start: 23,  end: 29 },
  { id: "1.3b",   start: 29,  end: 33 },
  { id: "1.4",    start: 33,  end: 41 },
  { id: "1.5",    start: 41,  end: 47 },
  { id: "1.5b",   start: 47,  end: 52 },
  { id: "rewind", start: 52,  end: 58 },
  { id: "2.0",    start: 58,  end: 64 },
  { id: "2.1",    start: 64,  end: 70 },
  { id: "2.1b",   start: 70,  end: 77 },
  { id: "2.2",    start: 77,  end: 85 },
  { id: "2.2b",   start: 85,  end: 90 },
  { id: "2.3",    start: 90,  end: 99 },
  { id: "2.3b",   start: 99,  end: 104 },
  { id: "2.4",    start: 104, end: 114 },
  { id: "2.4b",   start: 114, end: 120 },
  { id: "2.5",    start: 120, end: 128 },
  { id: "2.5b",   start: 128, end: 134 },
  { id: "3",      start: 134, end: 142 },
  { id: "3b",     start: 142, end: 150 },
];

function getSceneProgress(elapsed: number, scene: SceneDef) {
  if (elapsed < scene.start) return { active: false, progress: 0 };
  if (elapsed >= scene.end) return { active: false, progress: 1 };
  return { active: true, progress: (elapsed - scene.start) / (scene.end - scene.start) };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Typewriter helper ─────────────────────────────────────────────────────────
function useTypewriter(text: string, progress: number, startAt = 0.1, endAt = 0.8) {
  const t = Math.max(0, Math.min(1, (progress - startAt) / (endAt - startAt)));
  const chars = Math.floor(t * text.length);
  return text.slice(0, chars);
}

// ─── Scene components ───────────────────────────────────────────────────────────

interface SceneProps {
  progress: number;
  active: boolean;
}

// SCENE 1.0 — Title Card (NEW)
function Scene10({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const fadeOut = progress > 0.75 ? 1 - easeOut((progress - 0.75) * 4) : 1;
  const opacity = fadeIn * fadeOut;
  const shieldDraw = easeOut(Math.min(1, progress * 2.5));
  const subtitleFade = Math.max(0, (progress - 0.35) * 3);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0a0a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* Shield icon drawing on */}
      <div style={{ marginBottom: 30 }}>
        <svg width="120" height="140" viewBox="0 0 140 160">
          <path
            d="M70,10 L130,40 L130,90 Q130,140 70,155 Q10,140 10,90 L10,40 Z"
            fill="none"
            stroke="#028090"
            strokeWidth="3"
            strokeDasharray="500"
            strokeDashoffset={500 - shieldDraw * 500}
          />
          {/* AI text inside shield */}
          <text
            x="70"
            y="95"
            textAnchor="middle"
            fill="#028090"
            fontSize="36"
            fontWeight="700"
            opacity={shieldDraw}
          >
            AI
          </text>
        </svg>
      </div>

      {/* Main title */}
      <div
        style={{
          color: "#028090",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 2,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Swedbank FraudShield AI
      </div>
      <div
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: 300,
          letterSpacing: 1,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        presents
      </div>

      {/* Subtitle */}
      <div
        style={{
          color: "#ffffff88",
          fontSize: 16,
          fontStyle: "italic",
          opacity: subtitleFade,
          marginTop: 20,
          textAlign: "center",
        }}
      >
        A story about protecting those we love
      </div>
    </div>
  );
}

// SCENE 1.1 — Peaceful Home
function Scene11({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 2));
  const locationFade = Math.max(0, (progress - 0.5) * 2);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, #F5A62344 0%, #1A1A2E 70%)`,
        opacity: fadeIn,
      }}
    >
      {/* Warm overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #F5A62322 0%, #1A1A2E 100%)",
        }}
      />

      {/* Room SVG */}
      <svg
        viewBox="0 0 800 500"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          maxWidth: 700,
          opacity: fadeIn,
        }}
      >
        {/* Floor */}
        <line x1="50" y1="400" x2="750" y2="400" stroke="#F5A62344" strokeWidth="2" />

        {/* Window */}
        <rect x="500" y="100" width="150" height="180" rx="4" fill="none" stroke="#F5A62366" strokeWidth="2" />
        <line x1="575" y1="100" x2="575" y2="280" stroke="#F5A62344" strokeWidth="1" />
        <line x1="500" y1="190" x2="650" y2="190" stroke="#F5A62344" strokeWidth="1" />
        {/* Curtain lines */}
        <path d="M490,95 Q495,190 490,285" fill="none" stroke="#F5A62355" strokeWidth="2" />
        <path d="M660,95 Q655,190 660,285" fill="none" stroke="#F5A62355" strokeWidth="2" />
        {/* Moon glow */}
        <circle cx="550" cy="150" r="20" fill="#F5A62333" />
        <circle cx="550" cy="150" r="12" fill="#F5A62355" />

        {/* Bookshelf */}
        <rect x="100" y="120" width="120" height="200" rx="3" fill="none" stroke="#F5A62355" strokeWidth="2" />
        <line x1="100" y1="170" x2="220" y2="170" stroke="#F5A62344" strokeWidth="1.5" />
        <line x1="100" y1="220" x2="220" y2="220" stroke="#F5A62344" strokeWidth="1.5" />
        <line x1="100" y1="270" x2="220" y2="270" stroke="#F5A62344" strokeWidth="1.5" />
        {/* Books */}
        <rect x="110" y="130" width="8" height="35" rx="1" fill="#F5A62344" />
        <rect x="122" y="125" width="10" height="40" rx="1" fill="#CC000033" />
        <rect x="136" y="132" width="7" height="33" rx="1" fill="#02809044" />
        <rect x="150" y="128" width="9" height="37" rx="1" fill="#F5A62344" />
        {/* Photo frames */}
        <rect x="115" y="178" width="25" height="30" rx="2" fill="none" stroke="#F5A62366" strokeWidth="1.5" />
        <rect x="155" y="180" width="20" height="28" rx="2" fill="none" stroke="#F5A62366" strokeWidth="1.5" />

        {/* Armchair */}
        <path
          d="M280,400 L280,310 Q280,280 310,280 L390,280 Q420,280 420,310 L420,400"
          fill="none"
          stroke="#F5A62377"
          strokeWidth="3"
        />
        {/* Armrests */}
        <path d="M280,320 Q260,320 260,340 L260,380 Q260,400 280,400" fill="none" stroke="#F5A62366" strokeWidth="2.5" />
        <path d="M420,320 Q440,320 440,340 L440,380 Q440,400 420,400" fill="none" stroke="#F5A62366" strokeWidth="2.5" />
        {/* Cushion */}
        <ellipse cx="350" cy="340" rx="50" ry="15" fill="#F5A62322" stroke="#F5A62344" strokeWidth="1" />

        {/* Side table */}
        <rect x="460" y="350" width="50" height="50" rx="2" fill="none" stroke="#F5A62355" strokeWidth="2" />
        <line x1="455" y1="350" x2="515" y2="350" stroke="#F5A62366" strokeWidth="2" />

        {/* Tea cup */}
        <ellipse cx="485" cy="345" rx="12" ry="4" fill="none" stroke="#F5A62377" strokeWidth="1.5" />
        <path d="M473,345 L476,330 L494,330 L497,345" fill="none" stroke="#F5A62377" strokeWidth="1.5" />
        {/* Steam */}
        <path
          d="M482,325 Q480,315 484,308"
          fill="none"
          stroke="#F5A62344"
          strokeWidth="1"
          style={{
            opacity: 0.4 + Math.sin(progress * 10) * 0.3,
          }}
        />
        <path
          d="M488,325 Q490,312 486,305"
          fill="none"
          stroke="#F5A62344"
          strokeWidth="1"
          style={{
            opacity: 0.3 + Math.cos(progress * 10) * 0.3,
          }}
        />
      </svg>

      {/* Location text */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#F5A623",
          fontSize: 16,
          letterSpacing: 4,
          opacity: locationFade,
          textTransform: "uppercase",
        }}
      >
        Riga, Latvia
      </div>
    </div>
  );
}

// SCENE 1.2 — Phone Call
function Scene12({ progress }: SceneProps) {
  const bubbleText = "Vect\u0113v, it\u2019s me! I\u2019m in trouble... I need \u20AC2,000 right now!";
  const typed = useTypewriter(bubbleText, progress, 0.25, 0.75);
  const shakeX = progress > 0.05 && progress < 0.4
    ? Math.sin(progress * 120) * 4
    : 0;
  const shakeY = progress > 0.05 && progress < 0.4
    ? Math.cos(progress * 150) * 3
    : 0;
  const colorShift = progress;
  const vignetteOpacity = lerp(0, 0.4, progress);
  const phoneNumberOpacity = Math.max(0, (progress - 0.3) * 2.5);
  const bubbleOpacity = Math.max(0, (progress - 0.2) * 2);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, ${
          progress < 0.5 ? "#F5A62333" : "#3B82F622"
        } 0%, #1A1A2E 70%)`,
        transition: "background 1s",
      }}
    >
      {/* Re-use simplified room */}
      <svg
        viewBox="0 0 800 500"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          maxWidth: 700,
          filter: `saturate(${lerp(1, 0.6, colorShift)})`,
        }}
      >
        {/* Armchair simplified */}
        <path
          d="M280,400 L280,310 Q280,280 310,280 L390,280 Q420,280 420,310 L420,400"
          fill="none" stroke="#F5A62355" strokeWidth="3"
        />
        <path d="M280,320 Q260,320 260,340 L260,380 Q260,400 280,400" fill="none" stroke="#F5A62344" strokeWidth="2.5" />
        <path d="M420,320 Q440,320 440,340 L440,380 Q440,400 420,400" fill="none" stroke="#F5A62344" strokeWidth="2.5" />
        {/* Person silhouette in chair */}
        <circle cx="350" cy="250" r="22" fill="#F5A62333" stroke="#F5A62355" strokeWidth="1.5" />
        <path d="M330,275 Q350,300 370,275" fill="none" stroke="#F5A62344" strokeWidth="2" />

        {/* Side table */}
        <rect x="460" y="350" width="50" height="50" rx="2" fill="none" stroke="#F5A62344" strokeWidth="2" />
        <line x1="455" y1="350" x2="515" y2="350" stroke="#F5A62355" strokeWidth="2" />

        {/* Phone icon - vibrating */}
        <g transform={`translate(${485 + shakeX}, ${335 + shakeY})`}>
          <rect x="-10" y="-18" width="20" height="32" rx="3" fill="none" stroke="#CC0000" strokeWidth="2" />
          <circle cx="0" cy="9" r="2.5" fill="#CC0000" />
          {/* Ring waves */}
          {progress > 0.05 && progress < 0.4 && (
            <>
              <circle cx="0" cy="0" r="18" fill="none" stroke="#CC000066" strokeWidth="1"
                style={{ opacity: 0.3 + Math.sin(progress * 30) * 0.3 }} />
              <circle cx="0" cy="0" r="26" fill="none" stroke="#CC000044" strokeWidth="1"
                style={{ opacity: 0.2 + Math.cos(progress * 25) * 0.2 }} />
            </>
          )}
        </g>
      </svg>

      {/* Speech bubble */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1A1A2Eee",
          border: "1px solid #CC000066",
          borderRadius: 16,
          padding: "20px 28px",
          maxWidth: 440,
          minHeight: 60,
          opacity: bubbleOpacity,
          boxShadow: "0 0 30px #CC000022",
        }}
      >
        <div style={{ color: "#fff", fontSize: 18, lineHeight: 1.5, fontStyle: "italic" }}>
          &ldquo;{typed}&rdquo;
          <span style={{
            display: "inline-block",
            width: 2,
            height: 18,
            background: "#CC0000",
            marginLeft: 2,
            animation: "blink 0.8s infinite",
            verticalAlign: "text-bottom",
          }} />
        </div>
      </div>

      {/* Phone number */}
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#CC0000aa",
          fontSize: 14,
          letterSpacing: 2,
          fontFamily: "monospace",
          opacity: phoneNumberOpacity,
        }}
      >
        +371 2X XXX XXX
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, #000 100%)",
          opacity: vignetteOpacity,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// SCENE 1.2b — Close-up Worry (NEW)
function Scene12b({ progress }: SceneProps) {
  const line1 = useTypewriter("His voice trembled...", progress, 0.05, 0.4);
  const line2 = useTypewriter("He believed every word.", progress, 0.45, 0.85);
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const fadeOut = progress > 0.85 ? 1 - easeOut((progress - 0.85) * 6) : 1;
  // warm-to-cold gradient shift
  const coldShift = easeOut(Math.min(1, progress * 1.5));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(180deg, ${
          coldShift < 0.5 ? "#2a1a0e" : "#0e1a2a"
        } 0%, #0a0a14 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn * fadeOut,
        transition: "background 1.5s",
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: 36,
          fontWeight: 300,
          marginBottom: 24,
          textAlign: "center",
          minHeight: 50,
        }}
      >
        {line1}
        <span style={{
          display: "inline-block",
          width: 2,
          height: 32,
          background: progress < 0.42 ? "#ffffff88" : "transparent",
          marginLeft: 2,
          animation: "blink 0.8s infinite",
          verticalAlign: "text-bottom",
        }} />
      </div>
      <div
        style={{
          color: "#CC0000",
          fontSize: 32,
          fontWeight: 600,
          textAlign: "center",
          minHeight: 44,
        }}
      >
        {line2}
        {progress >= 0.45 && (
          <span style={{
            display: "inline-block",
            width: 2,
            height: 28,
            background: progress < 0.87 ? "#CC000088" : "transparent",
            marginLeft: 2,
            animation: "blink 0.8s infinite",
            verticalAlign: "text-bottom",
          }} />
        )}
      </div>
    </div>
  );
}

// SCENE 1.3 — Rush to Bank
function Scene13({ progress }: SceneProps) {
  const slideIn = easeOut(Math.min(1, progress * 3));
  const figureX = lerp(-50, 320, easeInOut(Math.min(1, progress * 1.5)));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        transform: `translateX(${lerp(100, 0, slideIn)}%)`,
      }}
    >
      {/* Red tint */}
      <div style={{ position: "absolute", inset: 0, background: "#CC000018", pointerEvents: "none" }} />

      <svg
        viewBox="0 0 800 500"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 750,
          filter: "saturate(0.5)",
        }}
      >
        {/* Building */}
        <rect x="250" y="120" width="300" height="280" rx="4" fill="#1A1A2E" stroke="#FF610066" strokeWidth="2" />
        {/* Swedbank orange bar */}
        <rect x="250" y="120" width="300" height="40" rx="4" fill="#FF6100" />
        <text x="400" y="147" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700">
          Swedbank
        </text>
        {/* Windows */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={280 + col * 65}
              y={180 + row * 70}
              width="40"
              height="50"
              rx="2"
              fill="#F5A62311"
              stroke="#F5A62333"
              strokeWidth="1"
            />
          ))
        )}
        {/* Door */}
        <rect x="370" y="330" width="60" height="70" rx="3" fill="#FF610033" stroke="#FF610066" strokeWidth="2" />
        <circle cx="420" cy="368" r="3" fill="#FF6100" />
        {/* Ground */}
        <line x1="100" y1="400" x2="700" y2="400" stroke="#ffffff22" strokeWidth="2" />

        {/* Stick figure walking */}
        <g transform={`translate(${figureX}, 350)`}>
          {/* Head */}
          <circle cx="0" cy="-35" r="8" fill="none" stroke="#ffffffaa" strokeWidth="2" />
          {/* Body */}
          <line x1="0" y1="-27" x2="0" y2="-5" stroke="#ffffffaa" strokeWidth="2" />
          {/* Legs - animated walk */}
          <line
            x1="0" y1="-5"
            x2={-8 + Math.sin(progress * 20) * 8} y2="10"
            stroke="#ffffffaa" strokeWidth="2"
          />
          <line
            x1="0" y1="-5"
            x2={8 - Math.sin(progress * 20) * 8} y2="10"
            stroke="#ffffffaa" strokeWidth="2"
          />
          {/* Arms */}
          <line
            x1="0" y1="-22"
            x2={-10 - Math.sin(progress * 20) * 5} y2="-12"
            stroke="#ffffffaa" strokeWidth="2"
          />
          <line
            x1="0" y1="-22"
            x2={10 + Math.sin(progress * 20) * 5} y2="-12"
            stroke="#ffffffaa" strokeWidth="2"
          />
        </g>

        {/* Motion lines */}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={figureX - 30 - i * 20}
            y1={330 + i * 10}
            x2={figureX - 50 - i * 20}
            y2={330 + i * 10}
            stroke="#ffffff33"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        ))}
      </svg>
    </div>
  );
}

// SCENE 1.3b — Inside the Bank (NEW)
function Scene13b({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const textFade = Math.max(0, (progress - 0.4) * 3);
  const pulseOpacity = 0.3 + Math.sin(progress * 8) * 0.2;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      <svg viewBox="0 0 800 500" style={{ width: "75%", maxWidth: 720 }}>
        {/* Bank counter */}
        <rect x="150" y="200" width="500" height="8" rx="2" fill="#FF610055" />
        <rect x="150" y="208" width="500" height="180" rx="0" fill="#1a1520" stroke="#FF610033" strokeWidth="1" />

        {/* Teller window / glass */}
        <rect x="300" y="80" width="200" height="120" rx="6" fill="#ffffff06" stroke="#ffffff22" strokeWidth="2" />
        <line x1="300" y1="160" x2="500" y2="160" stroke="#ffffff15" strokeWidth="1" />
        {/* Teller silhouette */}
        <circle cx="400" cy="115" r="16" fill="#ffffff15" stroke="#ffffff33" strokeWidth="1.5" />
        <path d="M375,140 Q400,155 425,140" fill="none" stroke="#ffffff22" strokeWidth="2" />

        {/* Janis figure at counter */}
        <circle cx="400" cy="250" r="14" fill="none" stroke="#ffffffaa" strokeWidth="2" />
        <line x1="400" y1="264" x2="400" y2="300" stroke="#ffffffaa" strokeWidth="2" />
        <line x1="400" y1="275" x2="385" y2="290" stroke="#ffffffaa" strokeWidth="2" />
        <line x1="400" y1="275" x2="415" y2="290" stroke="#ffffffaa" strokeWidth="2" />

        {/* Red ominous pulse behind amount */}
        <circle cx="400" cy="400" r={60 + progress * 20} fill="none" stroke="#CC0000" strokeWidth="2" opacity={pulseOpacity} />
        <circle cx="400" cy="400" r={40 + progress * 15} fill="none" stroke="#CC0000" strokeWidth="1" opacity={pulseOpacity * 0.6} />
      </svg>

      {/* Withdrawal text */}
      <div
        style={{
          position: "absolute",
          bottom: "16%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: textFade,
        }}
      >
        <div style={{
          display: "inline-block",
          background: "#CC000022",
          border: "1px solid #CC000055",
          borderRadius: 8,
          padding: "12px 28px",
          color: "#CC0000",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 1,
        }}>
          &euro;2,000 cash withdrawal
        </div>
      </div>
    </div>
  );
}

// SCENE 1.4 — Transfer
function Scene14({ progress }: SceneProps) {
  const cardFade = easeOut(Math.min(1, progress * 3));
  const confirmPress = progress > 0.55 && progress < 0.65;
  const confirmDone = progress > 0.65;
  const particlesActive = progress > 0.65 && progress < 0.9;
  const completeFade = Math.max(0, (progress - 0.85) * 6);
  const amountDissolve = progress > 0.65 ? Math.min(1, (progress - 0.65) * 5) : 0;

  const particles = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      tx: (Math.random() - 0.5) * 600,
      ty: (Math.random() - 0.5) * 400,
      dur: 0.8 + Math.random() * 1.2,
      delay: Math.random() * 0.3,
      size: 3 + Math.random() * 5,
    })), []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0d0d1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1A1A2E",
          border: "1px solid #ffffff22",
          borderRadius: 16,
          padding: "40px 48px",
          width: 420,
          opacity: cardFade,
          transform: `scale(${lerp(0.9, 1, cardFade)})`,
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Swedbank logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ color: "#FF6100", fontSize: 20, fontWeight: 700 }}>Swedbank</span>
        </div>

        <div style={{ color: "#ffffff88", fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 20, textAlign: "center" }}>
          Transfer Confirmation
        </div>

        {/* From */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#ffffff55", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>From</div>
          <div style={{ color: "#ffffffcc", fontSize: 15, marginTop: 4 }}>J&#257;nis B&#275;rzi&#326;&#353;</div>
          <div style={{ color: "#ffffff55", fontSize: 13, fontFamily: "monospace" }}>LV80HABA...4521</div>
        </div>

        {/* To */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#ffffff55", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>To</div>
          <div style={{ color: "#CC0000", fontSize: 15, marginTop: 4 }}>Unknown Account</div>
          <div style={{ color: "#ffffff55", fontSize: 13, fontFamily: "monospace" }}>EE382200...7890</div>
        </div>

        {/* Amount */}
        <div style={{ textAlign: "center", margin: "24px 0", position: "relative" }}>
          <div
            style={{
              color: "#fff",
              fontSize: 42,
              fontWeight: 700,
              opacity: 1 - amountDissolve,
              transform: `scale(${1 - amountDissolve * 0.3})`,
              transition: "opacity 0.3s, transform 0.3s",
            }}
          >
            &euro;2,000.00
          </div>

          {/* Particles */}
          {particlesActive && particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: "#CC0000",
                animation: `particleFly ${p.dur}s ${p.delay}s ease-out forwards`,
                ["--tx" as string]: `${p.tx}px`,
                ["--ty" as string]: `${p.ty}px`,
              }}
            />
          ))}
        </div>

        {/* Confirm button */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div
            style={{
              display: "inline-block",
              padding: "12px 40px",
              borderRadius: 8,
              background: confirmDone ? "#00C853" : confirmPress ? "#00C853" : "#CC0000",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              transform: confirmPress ? "scale(0.92)" : "scale(1)",
              transition: "all 0.2s",
              cursor: "default",
            }}
          >
            {confirmDone ? "CONFIRMED" : "CONFIRM"}
          </div>
        </div>

        {/* Transfer complete */}
        {completeFade > 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              color: "#00C853",
              fontSize: 18,
              fontWeight: 600,
              opacity: completeFade,
            }}
          >
            Transfer Complete &#10003;
          </div>
        )}
      </div>
    </div>
  );
}

// SCENE 1.5 — Realization
function Scene15({ progress }: SceneProps) {
  const text1Fade = easeOut(Math.min(1, progress * 4));
  const text2Fade = Math.max(0, (progress - 0.35) * 3);
  const stampShow = progress > 0.6;
  const stampScale = stampShow ? lerp(3, 1, easeOut(Math.min(1, (progress - 0.6) * 5))) : 3;
  const stampOpacity = stampShow ? easeOut(Math.min(1, (progress - 0.6) * 4)) : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0a0a12",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        filter: "saturate(0)",
      }}
    >
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 20%, #000 80%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            color: "#fff",
            fontSize: 36,
            fontWeight: 300,
            opacity: text1Fade,
            marginBottom: 20,
          }}
        >
          His grandson never called.
        </div>

        <div
          style={{
            color: "#CC0000",
            fontSize: 48,
            fontWeight: 700,
            opacity: text2Fade,
          }}
        >
          &euro;2,000 &mdash; GONE.
        </div>

        {/* Red X stamp */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${stampScale}) rotate(-5deg)`,
            opacity: stampOpacity,
            pointerEvents: "none",
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#CC0000" strokeWidth="6" />
            <line x1="50" y1="50" x2="150" y2="150" stroke="#CC0000" strokeWidth="10" strokeLinecap="round" />
            <line x1="150" y1="50" x2="50" y2="150" stroke="#CC0000" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// SCENE 1.5b — Emotional Impact / Statistics (NEW)
function Scene15b({ progress }: SceneProps) {
  const stats = [
    "Every year, 12,000+ elderly Europeans fall victim to vishing scams",
    "Average loss: \u20AC3,400",
    "Recovery rate: <5%",
  ];
  const fadeIn = easeOut(Math.min(1, progress * 3));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0a0a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      {stats.map((stat, i) => {
        const statStart = 0.1 + i * 0.25;
        const statFade = easeOut(Math.max(0, Math.min(1, (progress - statStart) * 4)));
        return (
          <div
            key={i}
            style={{
              color: i === 0 ? "#ffffffcc" : "#CC0000",
              fontSize: i === 0 ? 24 : 32,
              fontWeight: i === 0 ? 300 : 700,
              opacity: statFade,
              marginBottom: 24,
              textAlign: "center",
              maxWidth: 600,
              transform: `translateY(${lerp(20, 0, statFade)}px)`,
            }}
          >
            {stat}
          </div>
        );
      })}
    </div>
  );
}

// REWIND TRANSITION
function SceneRewind({ progress }: SceneProps) {
  const glitchIntensity = progress < 0.8 ? Math.sin(progress * 40) * 3 : 0;
  const textFade = easeOut(Math.min(1, progress * 2.5));
  const snapToBlack = progress > 0.85;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: snapToBlack ? "#000" : "#0a0a12",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Scan lines */}
      {!snapToBlack && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, #ffffff08 3px, #ffffff08 4px)",
            pointerEvents: "none",
            animation: "scanlines 0.1s linear infinite",
          }}
        />
      )}

      {/* Screen shake */}
      <div
        style={{
          transform: snapToBlack
            ? "none"
            : `translate(${glitchIntensity}px, ${Math.cos(progress * 50) * 2}px)`,
          textAlign: "center",
        }}
      >
        {/* Rewind icon */}
        {!snapToBlack && (
          <div
            style={{
              fontSize: 48,
              marginBottom: 24,
              transform: `rotate(${-progress * 720}deg)`,
              display: "inline-block",
            }}
          >
            &#9194;
          </div>
        )}

        {/* Glitch text */}
        {!snapToBlack && (
          <div style={{ position: "relative", opacity: textFade }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#fff",
                textShadow: `${-2 + glitchIntensity}px 0 #00FFFF, ${2 - glitchIntensity}px 0 #FF0000`,
                transform: `skewX(${glitchIntensity * 0.5}deg)`,
                letterSpacing: 2,
              }}
            >
              WHAT IF HE HAD FRAUDSHIELD?
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// SCENE 2.0 — Shield Activation (NEW)
function Scene20({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const shieldAssemble = easeOut(Math.min(1, progress * 2));
  const textPulse = progress > 0.5 ? 0.7 + Math.sin((progress - 0.5) * 12) * 0.3 : 0;
  const textFade = Math.max(0, (progress - 0.45) * 3);

  // Shield fragment positions: they fly in from edges
  const fragments = useMemo(() => [
    { startX: -300, startY: -200, endX: 0, endY: 0, d: "M70,10 L130,40 L130,65 L70,50 Z" },
    { startX: 300, startY: -200, endX: 0, endY: 0, d: "M70,10 L70,50 L10,65 L10,40 Z" },
    { startX: -300, startY: 200, endX: 0, endY: 0, d: "M130,65 L130,90 Q130,115 100,130 L70,50 Z" },
    { startX: 300, startY: 200, endX: 0, endY: 0, d: "M10,65 L70,50 L40,130 Q10,115 10,90 Z" },
    { startX: 0, startY: 300, endX: 0, endY: 0, d: "M100,130 L70,155 L40,130 L70,50 Z" },
  ], []);

  const shieldParticles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      angle: (i / 30) * Math.PI * 2,
      radius: 80 + Math.random() * 40,
      speed: 0.5 + Math.random() * 1.5,
      size: 2 + Math.random() * 3,
    })), []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0a0a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      {/* Swirling particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {shieldParticles.map((p) => {
          const angle = p.angle + progress * p.speed * 4;
          const x = Math.cos(angle) * p.radius;
          const y = Math.sin(angle) * p.radius;
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: "50%",
                top: "45%",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: "#028090",
                opacity: 0.3 + Math.sin(progress * 6 + p.id) * 0.2,
                transform: `translate(${x}px, ${y}px)`,
              }}
            />
          );
        })}
      </div>

      {/* Shield assembled from fragments */}
      <div style={{ marginBottom: 30 }}>
        <svg width="160" height="180" viewBox="0 0 140 160">
          {fragments.map((f, i) => {
            const t = easeOut(Math.min(1, Math.max(0, (shieldAssemble - i * 0.1) * 2)));
            const tx = lerp(f.startX, f.endX, t);
            const ty = lerp(f.startY, f.endY, t);
            return (
              <path
                key={i}
                d={f.d}
                fill="#02809033"
                stroke="#028090"
                strokeWidth="2"
                transform={`translate(${tx}, ${ty})`}
                opacity={t}
              />
            );
          })}
        </svg>
      </div>

      {/* Text */}
      <div
        style={{
          color: "#028090",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 2,
          opacity: textFade,
          textAlign: "center",
          textShadow: `0 0 ${10 + textPulse * 20}px #02809066`,
        }}
      >
        FraudShield AI &mdash; Activated
      </div>
    </div>
  );
}

// SCENE 2.1 — Same Call, Different
function Scene21({ progress }: SceneProps) {
  const bubbleText = "Vect\u0113v, it\u2019s me! I\u2019m in trouble... I need \u20AC2,000 right now!";
  const typed = useTypewriter(bubbleText, progress, 0.1, 0.6);
  const shieldPulse = 0.3 + Math.sin(progress * 8) * 0.15;
  const watchingFade = Math.max(0, (progress - 0.5) * 3);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, #02809022 0%, #1A1A2E 70%)`,
      }}
    >
      {/* Shield outline hexagons at edges */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <path
          d="M960,40 L1060,90 L1060,190 L960,240 L860,190 L860,90 Z"
          fill="none"
          stroke="#028090"
          strokeWidth="2"
          opacity={shieldPulse}
          transform="translate(-500, -20) scale(0.6)"
        />
        <path
          d="M960,40 L1060,90 L1060,190 L960,240 L860,190 L860,90 Z"
          fill="none"
          stroke="#028090"
          strokeWidth="2"
          opacity={shieldPulse}
          transform="translate(500, 600) scale(0.5)"
        />
        <path
          d="M960,40 L1060,90 L1060,190 L960,240 L860,190 L860,90 Z"
          fill="none"
          stroke="#028090"
          strokeWidth="1.5"
          opacity={shieldPulse * 0.6}
          transform="translate(-700, 300) scale(0.4)"
        />
        <path
          d="M960,40 L1060,90 L1060,190 L960,240 L860,190 L860,90 Z"
          fill="none"
          stroke="#028090"
          strokeWidth="1.5"
          opacity={shieldPulse * 0.6}
          transform="translate(700, 100) scale(0.45)"
        />
      </svg>

      {/* Speech bubble */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1A1A2Eee",
          border: "1px solid #02809066",
          borderRadius: 16,
          padding: "20px 28px",
          maxWidth: 440,
        }}
      >
        <div style={{ color: "#fff", fontSize: 18, lineHeight: 1.5, fontStyle: "italic" }}>
          &ldquo;{typed}&rdquo;
          <span style={{
            display: "inline-block",
            width: 2,
            height: 18,
            background: "#028090",
            marginLeft: 2,
            animation: "blink 0.8s infinite",
            verticalAlign: "text-bottom",
          }} />
        </div>
      </div>

      {/* FraudShield watching text */}
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: watchingFade,
        }}
      >
        <div style={{ color: "#028090", fontSize: 20, fontWeight: 600, letterSpacing: 1 }}>
          But this time, FraudShield is watching...
        </div>
      </div>
    </div>
  );
}

// SCENE 2.1b — AI Awakens (NEW)
function Scene21b({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const textFade = Math.max(0, (progress - 0.1) * 3);

  const layers = [
    { icon: "\uD83C\uDFA4", label: "Voice", delay: 0.25 },
    { icon: "\uD83D\uDCCA", label: "Transaction", delay: 0.4 },
    { icon: "\uD83D\uDD17", label: "Chain", delay: 0.55 },
  ];

  // Matrix-style characters
  const matrixCols = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (i / 40) * 100,
      speed: 1 + Math.random() * 2,
      offset: Math.random() * 100,
      chars: "01",
    })), []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0a0a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
        overflow: "hidden",
      }}
    >
      {/* Matrix falling characters */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.15 }}>
        {matrixCols.map((col) => {
          const y = ((progress * col.speed * 100 + col.offset) % 120) - 10;
          return (
            <div
              key={col.id}
              style={{
                position: "absolute",
                left: `${col.x}%`,
                top: `${y}%`,
                color: "#028090",
                fontSize: 14,
                fontFamily: "monospace",
                writingMode: "vertical-rl",
                letterSpacing: 4,
              }}
            >
              {col.chars.repeat(5)}
            </div>
          );
        })}
      </div>

      {/* Main text */}
      <div
        style={{
          color: "#028090",
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 40,
          opacity: textFade,
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        3 AI layers analyzing simultaneously...
      </div>

      {/* Three icons with progress bars */}
      <div style={{ display: "flex", gap: 50, alignItems: "center" }}>
        {layers.map((layer, i) => {
          const layerProgress = easeOut(Math.max(0, Math.min(1, (progress - layer.delay) * 3)));
          const barFill = easeOut(Math.max(0, Math.min(1, (progress - layer.delay - 0.1) * 2.5)));
          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                opacity: layerProgress,
                transform: `translateY(${lerp(20, 0, layerProgress)}px)`,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 10 }}>{layer.icon}</div>
              <div style={{ color: "#ffffffcc", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                {layer.label}
              </div>
              {/* Progress bar */}
              <div style={{
                width: 120,
                height: 6,
                background: "#ffffff15",
                borderRadius: 3,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${barFill * 100}%`,
                  height: "100%",
                  background: "#028090",
                  borderRadius: 3,
                  transition: "width 0.1s",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SCENE 2.2 — Voice AI Detection
function Scene22({ progress }: SceneProps) {
  const titleFade = easeOut(Math.min(1, progress * 3));
  const waveDraw = easeOut(Math.min(1, progress * 2));
  const callerSlide = Math.max(0, (progress - 0.3) * 2.5);
  const gaugeValue = easeOut(Math.min(1, (Math.max(0, progress - 0.4)) * 2.5)) * 94;
  const alertFade = Math.max(0, (progress - 0.7) * 3.5);
  const gaugeColor = gaugeValue < 30 ? "#00C853" : gaugeValue < 60 ? "#F5A623" : "#CC0000";

  // Generate wave paths
  const smoothWave = useMemo(() => {
    let d = "M0,50";
    for (let i = 0; i <= 200; i++) {
      const y = 50 + Math.sin(i * 0.15) * 20 + Math.sin(i * 0.08) * 10;
      d += ` L${i},${y}`;
    }
    return d;
  }, []);

  const jaggedWave = useMemo(() => {
    let d = "M0,50";
    for (let i = 0; i <= 200; i++) {
      const y = 50 + Math.sin(i * 0.3) * 25 + (Math.random() > 0.5 ? 10 : -10) * Math.sin(i * 0.5);
      d += ` L${i},${y}`;
    }
    return d;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        padding: "40px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <div
        style={{
          color: "#028090",
          fontSize: 28,
          fontWeight: 700,
          opacity: titleFade,
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        Voice AI Detection
      </div>

      {/* Waveforms */}
      <div
        style={{
          display: "flex",
          gap: 40,
          justifyContent: "center",
          marginBottom: 30,
          opacity: titleFade,
        }}
      >
        {/* Known Grandson */}
        <div style={{ flex: "0 0 280px", textAlign: "center" }}>
          <div style={{ color: "#00C853", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Known Grandson</div>
          <svg viewBox="0 0 200 100" style={{ width: "100%", height: 80 }}>
            <path
              d={smoothWave}
              fill="none"
              stroke="#00C853"
              strokeWidth="2"
              strokeDasharray="600"
              strokeDashoffset={600 - 600 * waveDraw}
            />
          </svg>
        </div>
        {/* Incoming Caller */}
        <div style={{ flex: "0 0 280px", textAlign: "center" }}>
          <div style={{ color: "#CC0000", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Incoming Caller</div>
          <svg viewBox="0 0 200 100" style={{ width: "100%", height: 80 }}>
            <path
              d={jaggedWave}
              fill="none"
              stroke="#CC0000"
              strokeWidth="2"
              strokeDasharray="800"
              strokeDashoffset={800 - 800 * waveDraw}
            />
          </svg>
        </div>
      </div>

      {/* Caller ID Analysis Panel */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#ffffff08",
            border: "1px solid #ffffff15",
            borderRadius: 12,
            padding: "16px 24px",
            opacity: easeOut(Math.min(1, callerSlide)),
            transform: `translateX(${lerp(40, 0, callerSlide)}px)`,
          }}
        >
          <div style={{ color: "#ffffff66", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            Caller ID Analysis
          </div>
          <div style={{ color: "#fff", fontFamily: "monospace", fontSize: 16, marginBottom: 6 }}>
            +371 2X XXX XXX
          </div>
          <span
            style={{
              display: "inline-block",
              background: "#CC000033",
              color: "#CC0000",
              fontSize: 12,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 4,
              letterSpacing: 1,
            }}
          >
            SPOOFED
          </span>
        </div>

        {/* Risk gauge */}
        <div style={{ textAlign: "center", opacity: easeOut(Math.min(1, callerSlide)) }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Background arc */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#ffffff11"
              strokeWidth="8"
              strokeDasharray="235 80"
              strokeDashoffset="-40"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={gaugeColor}
              strokeWidth="8"
              strokeDasharray={`${(gaugeValue / 100) * 235} ${315 - (gaugeValue / 100) * 235}`}
              strokeDashoffset="-40"
              strokeLinecap="round"
              style={{ transition: "stroke 0.3s" }}
            />
            <text x="60" y="65" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700">
              {Math.round(gaugeValue)}
            </text>
            <text x="60" y="82" textAnchor="middle" fill="#ffffff55" fontSize="10">
              Risk Score
            </text>
          </svg>
        </div>
      </div>

      {/* Alert */}
      <div
        style={{
          textAlign: "center",
          opacity: alertFade,
          animation: alertFade > 0.5 ? "alertPulse 1.5s infinite" : "none",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#CC000022",
            border: "1px solid #CC000066",
            borderRadius: 8,
            padding: "12px 24px",
            color: "#CC0000",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          &#9888;&#65039; SPOOFED NUMBER DETECTED &mdash; 94% Confidence
        </div>
        <div style={{ color: "#ffffff55", fontSize: 13, marginTop: 10 }}>
          Voice AI: Caller ID spoofing detected
        </div>
      </div>
    </div>
  );
}

// SCENE 2.2b — Voice Mismatch Detail (NEW)
function Scene22b({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const labelFade = Math.max(0, (progress - 0.5) * 3);

  // Grandson bars (even/smooth)
  const grandsonBars = [65, 70, 68, 72, 66];
  // Caller bars (erratic)
  const callerBars = [90, 30, 85, 20, 95];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      <div style={{ display: "flex", gap: 60, marginBottom: 40 }}>
        {/* Grandson card */}
        <div style={{
          background: "#00C85311",
          border: "1px solid #00C85344",
          borderRadius: 12,
          padding: "24px 32px",
          width: 240,
          textAlign: "center",
        }}>
          <div style={{ color: "#00C853", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Grandson Voice Profile
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "flex-end", height: 80 }}>
            {grandsonBars.map((h, i) => {
              const barP = easeOut(Math.max(0, Math.min(1, (progress - 0.1 - i * 0.05) * 4)));
              return (
                <div key={i} style={{
                  width: 24,
                  height: barP * h,
                  background: "#00C853",
                  borderRadius: "3px 3px 0 0",
                  minHeight: 2,
                }} />
              );
            })}
          </div>
          <div style={{ color: "#00C85388", fontSize: 11, marginTop: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Known patterns
          </div>
        </div>

        {/* Caller card */}
        <div style={{
          background: "#CC000011",
          border: "1px solid #CC000044",
          borderRadius: 12,
          padding: "24px 32px",
          width: 240,
          textAlign: "center",
        }}>
          <div style={{ color: "#CC0000", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Caller Voice
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "flex-end", height: 80 }}>
            {callerBars.map((h, i) => {
              const barP = easeOut(Math.max(0, Math.min(1, (progress - 0.15 - i * 0.05) * 4)));
              return (
                <div key={i} style={{
                  width: 24,
                  height: barP * h,
                  background: "#CC0000",
                  borderRadius: "3px 3px 0 0",
                  minHeight: 2,
                }} />
              );
            })}
          </div>
          <div style={{ color: "#CC000088", fontSize: 11, marginTop: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Mismatched patterns
          </div>
        </div>
      </div>

      {/* Labels */}
      <div style={{ textAlign: "center", opacity: labelFade }}>
        <div style={{ color: "#CC0000", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
          Voice Mismatch: 87%
        </div>
        <div style={{ color: "#ffffff66", fontSize: 15 }}>
          Number Origin: Foreign VoIP
        </div>
      </div>
    </div>
  );
}

// SCENE 2.3 — Transaction AI
function Scene23({ progress }: SceneProps) {
  const titleFade = easeOut(Math.min(1, progress * 3));
  const barHeights = [45, 60, 35, 55, 40, 70, 50, 65, 55, 45, 60, 200];
  const cardTexts = [
    "\u26A0 New Recipient",
    "\u26A0 Unusual Amount (10\u00D7 avg)",
    "\u26A0 Urgent Timing Pattern",
  ];
  const riskScore = easeOut(Math.min(1, Math.max(0, (progress - 0.5) * 2.5))) * 91;
  const riskColor = riskScore < 30 ? "#00C853" : riskScore < 60 ? "#F5A623" : "#CC0000";
  const alertFade = Math.max(0, (progress - 0.85) * 7);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        padding: "40px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ color: "#028090", fontSize: 28, fontWeight: 700, opacity: titleFade, marginBottom: 30, textAlign: "center" }}>
        Transaction AI Analysis
      </div>

      {/* Chart + Cards row */}
      <div style={{ display: "flex", gap: 40, justifyContent: "center", alignItems: "flex-end", marginBottom: 30, flex: 1 }}>
        {/* Bar chart */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 220 }}>
          {barHeights.map((h, i) => {
            const barProgress = Math.max(0, Math.min(1, (progress - 0.05 - i * 0.03) * 4));
            const isLast = i === barHeights.length - 1;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 28,
                    height: easeOut(barProgress) * h,
                    background: isLast ? "#CC0000" : "#028090",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s",
                    minHeight: 2,
                  }}
                />
                {isLast && barProgress > 0.5 && (
                  <div style={{ color: "#CC0000", fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                    &euro;2,000
                  </div>
                )}
                {!isLast && (
                  <div style={{ color: "#ffffff33", fontSize: 9, marginTop: 4 }}>
                    {["J","F","M","A","M","J","J","A","S","O","N"][i]}
                  </div>
                )}
                {isLast && (
                  <div style={{ color: "#CC0000", fontSize: 9, marginTop: barProgress > 0.5 ? 0 : 4 }}>
                    D
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cardTexts.map((text, i) => {
            const cardProgress = Math.max(0, (progress - 0.35 - i * 0.08) * 3);
            return (
              <div
                key={i}
                style={{
                  background: "#CC000015",
                  border: "1px solid #CC000044",
                  borderRadius: 8,
                  padding: "10px 18px",
                  color: "#CC0000",
                  fontSize: 14,
                  fontWeight: 500,
                  opacity: easeOut(Math.min(1, cardProgress)),
                  transform: `translateX(${lerp(30, 0, Math.min(1, cardProgress))}px)`,
                }}
              >
                {text}
              </div>
            );
          })}
          {/* Badge */}
          <div
            style={{
              background: "#02809022",
              border: "1px solid #02809055",
              borderRadius: 8,
              padding: "8px 18px",
              color: "#028090",
              fontSize: 13,
              fontWeight: 600,
              opacity: easeOut(Math.min(1, Math.max(0, (progress - 0.6) * 3))),
              textAlign: "center",
            }}
          >
            47 Features Analyzed
          </div>
        </div>
      </div>

      {/* Risk score */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ color: "#ffffff55", fontSize: 14, marginRight: 10 }}>Risk Score:</span>
        <span style={{ color: riskColor, fontSize: 36, fontWeight: 700, fontFamily: "monospace", transition: "color 0.3s" }}>
          {Math.round(riskScore)}
        </span>
        <span style={{ color: "#ffffff44", fontSize: 20 }}>/100</span>
      </div>

      {/* Alert */}
      <div
        style={{
          textAlign: "center",
          opacity: alertFade,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#CC000022",
            border: "1px solid #CC000066",
            borderRadius: 8,
            padding: "10px 20px",
            color: "#CC0000",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          &#9888;&#65039; ANOMALOUS TRANSFER &mdash; Risk Score: 91/100
        </div>
      </div>
    </div>
  );
}

// SCENE 2.3b — Feature Breakdown (NEW)
function Scene23b({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const features = [
    "Recipient: Never seen before \u26A0\uFE0F",
    "Amount: 10\u00D7 average \u26A0\uFE0F",
    "Time: Outside normal hours \u26A0\uFE0F",
    "Location: Unusual branch \u26A0\uFE0F",
    "Urgency: High pressure \u26A0\uFE0F",
    "Pattern: Matches vishing template \u26A0\uFE0F",
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      {/* Watermark */}
      <div style={{
        position: "absolute",
        fontSize: 80,
        fontWeight: 900,
        color: "#ffffff06",
        letterSpacing: 4,
        pointerEvents: "none",
      }}>
        47 FEATURES
      </div>

      {/* 2x3 Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        maxWidth: 600,
        position: "relative",
        zIndex: 1,
      }}>
        {features.map((feat, i) => {
          const cardDelay = 0.05 + i * 0.12;
          const cardP = easeOut(Math.max(0, Math.min(1, (progress - cardDelay) * 4)));
          return (
            <div
              key={i}
              style={{
                background: "#CC000015",
                border: "1px solid #CC000044",
                borderRadius: 10,
                padding: "14px 20px",
                color: "#CC0000",
                fontSize: 14,
                fontWeight: 500,
                opacity: cardP,
                transform: `rotateY(${lerp(90, 0, cardP)}deg)`,
                transformOrigin: "left center",
              }}
            >
              {feat}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SCENE 2.4 — Transaction Paused + Chain
function Scene24({ progress }: SceneProps) {
  const pausedFade = easeOut(Math.min(1, progress * 3));
  const pulseBorder = 0.5 + Math.sin(progress * 10) * 0.3;

  // Chain nodes appear at staggered times
  const chain = [
    { emoji: "\uD83C\uDFE6", label: "Bank", color: "#FF6100", activateAt: 0.15 },
    { emoji: "\uD83D\uDCF1", label: "Telecom", color: "#3B82F6", activateAt: 0.35 },
    { emoji: "\u2696\uFE0F", label: "Authority", color: "#8B5CF6", activateAt: 0.55 },
  ];

  const denied = progress > 0.82;
  const statusDots = progress < 0.82
    ? ".".repeat(1 + Math.floor((progress * 10) % 4))
    : "";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* TRANSACTION PAUSED */}
      <div
        style={{
          border: `2px solid rgba(2, 128, 144, ${pulseBorder})`,
          borderRadius: 16,
          padding: "20px 48px",
          marginBottom: 50,
          opacity: pausedFade,
          boxShadow: `0 0 ${20 + Math.sin(progress * 10) * 10}px #02809033`,
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700, color: "#028090", textAlign: "center" }}>
          &#128737;&#65039; TRANSACTION PAUSED
        </div>
      </div>

      {/* Chain of Responsibility */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40, opacity: pausedFade }}>
        {chain.map((node, i) => {
          const nodeActive = progress > node.activateAt;
          const nodeGlow = nodeActive ? 0.5 + Math.sin((progress - node.activateAt) * 12) * 0.3 : 0.2;
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: `2px solid ${node.color}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: nodeGlow + 0.3,
                  boxShadow: nodeActive ? `0 0 20px ${node.color}44` : "none",
                  transition: "all 0.5s",
                  background: nodeActive ? `${node.color}15` : "transparent",
                }}
              >
                <span style={{ fontSize: 28 }}>{node.emoji}</span>
                <span style={{ color: node.color, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                  {node.label}
                </span>
              </div>
              {i < chain.length - 1 && (
                <svg width="60" height="20" viewBox="0 0 60 20" style={{ margin: "0 -4px" }}>
                  <line
                    x1="0" y1="10" x2="50" y2="10"
                    stroke="#ffffff33"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    style={{
                      animation: progress > chain[i + 1].activateAt ? "dashFlow 1s linear infinite" : "none",
                    }}
                  />
                  <polygon points="50,5 60,10 50,15" fill="#ffffff44" />
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Status text */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 500,
          textAlign: "center",
          opacity: pausedFade,
          transition: "color 0.3s",
          color: denied ? "#CC0000" : "#ffffff88",
        }}
      >
        {denied
          ? "\u274C CUSTOMER DENIED \u2014 Transaction Cancelled"
          : `Awaiting customer confirmation${statusDots}`
        }
      </div>
    </div>
  );
}

// SCENE 2.4b — Verification Call (NEW)
function Scene24b({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const ringPulse = Math.sin(progress * 12) * 0.3 + 0.7;
  const questionFade = Math.max(0, (progress - 0.25) * 3);
  const answerFade = Math.max(0, (progress - 0.5) * 3);
  const confirmFade = Math.max(0, (progress - 0.75) * 4);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      {/* Phone icon with ring waves */}
      <div style={{ position: "relative", marginBottom: 30 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          {/* Ring waves */}
          <circle cx="40" cy="40" r="30" fill="none" stroke="#028090" strokeWidth="2" opacity={ringPulse * 0.5} />
          <circle cx="40" cy="40" r="38" fill="none" stroke="#028090" strokeWidth="1.5" opacity={ringPulse * 0.3} />
          {/* Phone */}
          <rect x="28" y="18" width="24" height="44" rx="4" fill="none" stroke="#028090" strokeWidth="2.5" />
          <circle cx="40" cy="54" r="3" fill="#028090" />
        </svg>
      </div>

      {/* Calling text */}
      <div style={{ color: "#028090", fontSize: 18, fontWeight: 500, marginBottom: 30, letterSpacing: 1 }}>
        Automated verification call to J&#257;nis...
      </div>

      {/* Speech bubble - question */}
      <div
        style={{
          background: "#02809022",
          border: "1px solid #02809055",
          borderRadius: 12,
          padding: "16px 24px",
          maxWidth: 420,
          marginBottom: 16,
          opacity: questionFade,
          transform: `translateY(${lerp(10, 0, questionFade)}px)`,
        }}
      >
        <div style={{ color: "#ffffffcc", fontSize: 16, fontStyle: "italic" }}>
          &ldquo;Did you request a &euro;2,000 transfer?&rdquo;
        </div>
      </div>

      {/* Speech bubble - answer */}
      <div
        style={{
          background: "#CC000015",
          border: "1px solid #CC000044",
          borderRadius: 12,
          padding: "16px 24px",
          maxWidth: 420,
          marginBottom: 24,
          opacity: answerFade,
          transform: `translateY(${lerp(10, 0, answerFade)}px)`,
        }}
      >
        <div style={{ color: "#ffffffcc", fontSize: 16, fontStyle: "italic" }}>
          &ldquo;No... that wasn&rsquo;t my grandson!&rdquo;
        </div>
      </div>

      {/* Status confirmed */}
      <div
        style={{
          opacity: confirmFade,
          textAlign: "center",
        }}
      >
        <div style={{
          display: "inline-block",
          background: "#CC000022",
          border: "1px solid #CC000066",
          borderRadius: 8,
          padding: "10px 24px",
          color: "#CC0000",
          fontSize: 15,
          fontWeight: 600,
        }}>
          &#9889; Customer alert confirmed &mdash; Transaction cancelled
        </div>
      </div>
    </div>
  );
}

// SCENE 2.5 — Fraud Blocked
function Scene25({ progress }: SceneProps) {
  const shieldScale = progress < 0.3
    ? lerp(0, 1.1, easeOut(progress / 0.3))
    : lerp(1.1, 1.0, easeOut((progress - 0.3) / 0.15));
  const shieldOpacity = easeOut(Math.min(1, progress * 4));
  const checkDraw = easeOut(Math.min(1, Math.max(0, (progress - 0.2) * 3)));
  const textFade = Math.max(0, (progress - 0.35) * 3);

  const particles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      delay: Math.random() * 3,
      dur: 2 + Math.random() * 3,
      size: 3 + Math.random() * 4,
    })), []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, #00C85311 0%, #1A1A2E 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Green particles floating up */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: -10,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "#00C85355",
            animation: `floatUp ${p.dur}s ${p.delay}s linear infinite`,
          }}
        />
      ))}

      {/* Shield */}
      <div
        style={{
          transform: `scale(${shieldScale})`,
          opacity: shieldOpacity,
          marginBottom: 30,
        }}
      >
        <svg width="140" height="160" viewBox="0 0 140 160">
          {/* Shield shape */}
          <path
            d="M70,10 L130,40 L130,90 Q130,140 70,155 Q10,140 10,90 L10,40 Z"
            fill="#00C85322"
            stroke="#00C853"
            strokeWidth="3"
          />
          {/* Checkmark */}
          <path
            d="M45,82 L62,100 L98,60"
            fill="none"
            stroke="#00C853"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100"
            strokeDashoffset={100 - checkDraw * 100}
          />
        </svg>
      </div>

      {/* Text */}
      <div style={{ textAlign: "center", opacity: textFade }}>
        <div style={{ color: "#00C853", fontSize: 48, fontWeight: 700, marginBottom: 10 }}>
          FRAUD BLOCKED
        </div>
        <div style={{ color: "#fff", fontSize: 36, fontWeight: 300 }}>
          &euro;2,000 SAVED
        </div>
      </div>
    </div>
  );
}

// SCENE 2.5b — Money Returns (NEW)
function Scene25b({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  // Counter rolls from 0 to 2000
  const counterProgress = easeOut(Math.min(1, Math.max(0, (progress - 0.1) * 2)));
  const counterValue = Math.round(counterProgress * 2000);
  const badgeFade = Math.max(0, (progress - 0.6) * 3);
  const balanceFade = Math.max(0, (progress - 0.75) * 4);

  // Format with leading zeros for slot-machine effect
  const formatted = counterValue.toLocaleString("en-US");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      {/* Euro counter */}
      <div style={{
        color: "#00C853",
        fontSize: 72,
        fontWeight: 700,
        fontFamily: "monospace",
        marginBottom: 20,
        textShadow: "0 0 20px #00C85333",
      }}>
        &euro;{formatted}
      </div>

      {/* Funds secured badge */}
      <div
        style={{
          opacity: badgeFade,
          display: "inline-block",
          background: "#00C85322",
          border: "2px solid #00C853",
          borderRadius: 8,
          padding: "10px 28px",
          marginBottom: 24,
        }}
      >
        <span style={{ color: "#00C853", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
          FUNDS SECURED
        </span>
      </div>

      {/* Account balance */}
      <div
        style={{
          color: "#00C853",
          fontSize: 18,
          fontWeight: 500,
          opacity: balanceFade,
        }}
      >
        Account balance: Protected
      </div>
    </div>
  );
}

// SCENE 3 — Closing Card
function Scene3({ progress }: SceneProps) {
  const shieldDraw = easeOut(Math.min(1, progress * 2.5));
  const titleFade = Math.max(0, (progress - 0.15) * 3);
  const subtitleFade = Math.max(0, (progress - 0.3) * 3);
  const stats = [
    "96.2% Detection Accuracy",
    "<50ms Response Time",
    "3 Sectors United",
  ];
  const taglineFade = Math.max(0, (progress - 0.7) * 4);
  const creditsFade = Math.max(0, (progress - 0.8) * 5);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1A1A2E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Shield with circuit pattern */}
      <div style={{ marginBottom: 30, opacity: shieldDraw }}>
        <svg width="100" height="115" viewBox="0 0 140 160">
          <path
            d="M70,10 L130,40 L130,90 Q130,140 70,155 Q10,140 10,90 L10,40 Z"
            fill="none"
            stroke="#028090"
            strokeWidth="2.5"
            strokeDasharray="500"
            strokeDashoffset={500 - shieldDraw * 500}
          />
          {/* Circuit lines inside shield */}
          <line x1="40" y1="60" x2="70" y2="60" stroke="#02809055" strokeWidth="1" strokeDasharray="200" strokeDashoffset={200 - shieldDraw * 200} />
          <line x1="70" y1="60" x2="70" y2="90" stroke="#02809055" strokeWidth="1" strokeDasharray="200" strokeDashoffset={200 - shieldDraw * 200} />
          <line x1="70" y1="90" x2="100" y2="90" stroke="#02809055" strokeWidth="1" strokeDasharray="200" strokeDashoffset={200 - shieldDraw * 200} />
          <line x1="50" y1="80" x2="90" y2="80" stroke="#02809044" strokeWidth="1" strokeDasharray="200" strokeDashoffset={200 - shieldDraw * 200} />
          <circle cx="70" cy="60" r="3" fill="#028090" opacity={shieldDraw} />
          <circle cx="70" cy="90" r="3" fill="#028090" opacity={shieldDraw} />
          <circle cx="100" cy="90" r="2" fill="#028090" opacity={shieldDraw} />
          <circle cx="50" cy="80" r="2" fill="#028090" opacity={shieldDraw} />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          color: "#028090",
          fontSize: 36,
          fontWeight: 700,
          opacity: titleFade,
          marginBottom: 8,
        }}
      >
        Swedbank FraudShield AI
      </div>

      <div
        style={{
          color: "#ffffffcc",
          fontSize: 18,
          fontWeight: 300,
          opacity: subtitleFade,
          marginBottom: 36,
        }}
      >
        AI-Powered Cross-Sector Fraud Detection
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 40, marginBottom: 36 }}>
        {stats.map((stat, i) => {
          const statFade = Math.max(0, (progress - 0.4 - i * 0.07) * 4);
          return (
            <div
              key={i}
              style={{
                color: "#ffffffaa",
                fontSize: 15,
                fontWeight: 500,
                opacity: easeOut(Math.min(1, statFade)),
                textAlign: "center",
                padding: "10px 20px",
                background: "#ffffff08",
                borderRadius: 8,
                border: "1px solid #ffffff11",
              }}
            >
              {stat}
            </div>
          );
        })}
      </div>

      {/* Tagline */}
      <div
        style={{
          color: "#ffffffaa",
          fontSize: 17,
          fontStyle: "italic",
          opacity: taglineFade,
          marginBottom: 24,
        }}
      >
        The future of fraud prevention is collaborative.
      </div>

      {/* Credits */}
      <div
        style={{
          color: "#8899AA",
          fontSize: 13,
          opacity: creditsFade,
        }}
      >
        Riga Technical University | Hackathon 2026
      </div>
    </div>
  );
}

// SCENE 3b — Team Credit (NEW)
function Scene3b({ progress }: SceneProps) {
  const fadeIn = easeOut(Math.min(1, progress * 3));
  const fadeOut = progress > 0.8 ? 1 - easeOut((progress - 0.8) * 5) : 1;
  const opacity = fadeIn * fadeOut;
  const builtByFade = easeOut(Math.min(1, progress * 4));

  const teamNames = [
    "Temur Malishava",
    "Jokubas Mickevicius",
    "Nikita Persidskiy",
    "Dominik Piotrowski",
  ];

  const uniTextFade = Math.max(0, (progress - 0.4) * 3);
  const poweredFade = Math.max(0, (progress - 0.55) * 3);
  const dividerFade = Math.max(0, (progress - 0.65) * 4);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0a0a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* Built by */}
      <div style={{ color: "#ffffff66", fontSize: 16, letterSpacing: 3, textTransform: "uppercase", marginBottom: 24, opacity: builtByFade }}>
        Built by
      </div>

      {/* Team names */}
      <div style={{ marginBottom: 30 }}>
        {teamNames.map((name, i) => {
          const nameFade = easeOut(Math.max(0, Math.min(1, (progress - 0.08 - i * 0.06) * 5)));
          return (
            <div
              key={i}
              style={{
                color: "#ffffffcc",
                fontSize: 22,
                fontWeight: 500,
                textAlign: "center",
                marginBottom: 8,
                opacity: nameFade,
                transform: `translateY(${lerp(10, 0, nameFade)}px)`,
              }}
            >
              {name}
            </div>
          );
        })}
      </div>

      {/* University */}
      <div style={{ color: "#028090", fontSize: 16, fontWeight: 600, marginBottom: 16, opacity: uniTextFade, textAlign: "center" }}>
        Riga Technical University &mdash; Hackathon 2026
      </div>

      {/* Powered by */}
      <div style={{ color: "#ffffff88", fontSize: 15, fontStyle: "italic", marginBottom: 20, opacity: poweredFade, textAlign: "center" }}>
        Powered by AI. Protected by collaboration.
      </div>

      {/* Swedbank orange divider */}
      <div
        style={{
          width: lerp(0, 200, easeOut(Math.min(1, dividerFade))),
          height: 2,
          background: "#FF6100",
          borderRadius: 1,
        }}
      />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function DemoVideoPage() {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => {
          pausedRef.current = !p;
          if (!p) lastTimeRef.current = null; // reset lastTime so delta doesn't jump
          return !p;
        });
      }
      if (e.code === "KeyR") {
        setElapsed(0);
        lastTimeRef.current = null;
        setPaused(false);
        pausedRef.current = false;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Master timeline via requestAnimationFrame
  useEffect(() => {
    let rafId: number;

    const tick = (timestamp: number) => {
      if (!pausedRef.current) {
        if (lastTimeRef.current !== null) {
          const dt = (timestamp - lastTimeRef.current) / 1000;
          setElapsed((prev) => {
            const next = prev + dt;
            return next >= TOTAL_DURATION ? TOTAL_DURATION : next;
          });
        }
        lastTimeRef.current = timestamp;
      } else {
        lastTimeRef.current = null;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Scene rendering with cross-fade
  const FADE_DURATION = 0.3;

  function getSceneOpacity(scene: SceneDef): number {
    if (elapsed < scene.start - FADE_DURATION) return 0;
    if (elapsed >= scene.end + FADE_DURATION) return 0;

    let opacity = 1;
    // Fade in
    if (elapsed < scene.start + FADE_DURATION) {
      opacity = Math.min(opacity, (elapsed - (scene.start - FADE_DURATION)) / (FADE_DURATION * 2));
    }
    // Fade out
    if (elapsed > scene.end - FADE_DURATION) {
      opacity = Math.min(opacity, ((scene.end + FADE_DURATION) - elapsed) / (FADE_DURATION * 2));
    }
    return Math.max(0, Math.min(1, opacity));
  }

  const sceneComponents: Record<string, React.FC<SceneProps>> = {
    "1.0": Scene10,
    "1.1": Scene11,
    "1.2": Scene12,
    "1.2b": Scene12b,
    "1.3": Scene13,
    "1.3b": Scene13b,
    "1.4": Scene14,
    "1.5": Scene15,
    "1.5b": Scene15b,
    "rewind": SceneRewind,
    "2.0": Scene20,
    "2.1": Scene21,
    "2.1b": Scene21b,
    "2.2": Scene22,
    "2.2b": Scene22b,
    "2.3": Scene23,
    "2.3b": Scene23b,
    "2.4": Scene24,
    "2.4b": Scene24b,
    "2.5": Scene25,
    "2.5b": Scene25b,
    "3": Scene3,
    "3b": Scene3b,
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 10);
    return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes particleFly {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }
        @keyframes alertPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes dashFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
      `}</style>

      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "#1A1A2E",
          position: "relative",
          fontFamily: "inherit",
          userSelect: "none",
        }}
      >
        {/* Scene layers */}
        {SCENES.map((scene) => {
          const opacity = getSceneOpacity(scene);
          if (opacity <= 0) return null;
          const { active, progress } = getSceneProgress(elapsed, scene);
          const SceneComp = sceneComponents[scene.id];
          if (!SceneComp) return null;
          return (
            <div
              key={scene.id}
              style={{
                position: "absolute",
                inset: 0,
                opacity,
                pointerEvents: active ? "auto" : "none",
                zIndex: active ? 2 : 1,
              }}
            >
              <SceneComp progress={progress} active={active || opacity > 0} />
            </div>
          );
        })}

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            width: `${(elapsed / TOTAL_DURATION) * 100}%`,
            background: "#028090",
            zIndex: 100,
            transition: "width 0.1s linear",
          }}
        />

        {/* Timecode (visible only when paused) */}
        {paused && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 12,
              color: "#ffffff66",
              fontSize: 12,
              fontFamily: "monospace",
              zIndex: 100,
            }}
          >
            {formatTime(elapsed)} / {formatTime(TOTAL_DURATION)}
          </div>
        )}

        {/* Pause indicator */}
        {paused && (
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              color: "#ffffff44",
              fontSize: 13,
              fontWeight: 500,
              zIndex: 100,
              letterSpacing: 2,
            }}
          >
            PAUSED &mdash; SPACE to resume
          </div>
        )}
      </div>
    </>
  );
}
