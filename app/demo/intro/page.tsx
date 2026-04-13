"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  PARTICLE GENERATOR — 40 small red dots with random trajectories   */
/* ------------------------------------------------------------------ */
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * 360;
    const distance = 200 + Math.random() * 400;
    const tx = Math.cos((angle * Math.PI) / 180) * distance;
    const ty = Math.sin((angle * Math.PI) / 180) * distance;
    const duration = 0.6 + Math.random() * 0.8;
    const delay = Math.random() * 0.3;
    const size = 3 + Math.random() * 5;
    return { id: i, tx, ty, duration, delay, size };
  });
}

const PARTICLES = generateParticles(40);

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                               */
/* ------------------------------------------------------------------ */
export default function DemoIntroPage() {
  const [scene, setScene] = useState(0); // 0 = 1.4, 1 = 1.5, 2 = rewind
  const [subStep, setSubStep] = useState(0);
  const totalScenes = 3;

  /* keyboard navigation */
  const advance = useCallback(() => {
    setSubStep((prev) => {
      const maxSub = scene === 0 ? 3 : scene === 1 ? 2 : 2;
      if (prev < maxSub) return prev + 1;
      // move to next scene
      if (scene < totalScenes - 1) {
        setScene((s) => s + 1);
        return 0;
      }
      return prev;
    });
  }, [scene]);

  const goBack = useCallback(() => {
    setSubStep((prev) => {
      if (prev > 0) return prev - 1;
      if (scene > 0) {
        setScene((s) => {
          const prevScene = s - 1;
          // jump to last substep of previous scene
          setTimeout(() => {
            const maxSub = prevScene === 0 ? 3 : prevScene === 1 ? 2 : 2;
            setSubStep(maxSub);
          }, 0);
          return prevScene;
        });
        return 0;
      }
      return prev;
    });
  }, [scene]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, goBack]);

  return (
    <div style={styles.viewport}>
      <style>{globalCSS}</style>

      {scene === 0 && <SceneTransfer subStep={subStep} />}
      {scene === 1 && <SceneRealization subStep={subStep} />}
      {scene === 2 && <SceneRewind subStep={subStep} />}

      {/* scene counter */}
      <div style={styles.counter}>
        Scene {scene + 1} / {totalScenes} &mdash; Step {subStep}
        <br />
        <span style={{ fontSize: 11, opacity: 0.5 }}>
          Space / Arrow keys to navigate
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SCENE 1.4 — THE TRANSFER SCREEN                                  */
/* ================================================================== */
function SceneTransfer({ subStep }: { subStep: number }) {
  const confirmed = subStep >= 1;
  const dissolving = subStep >= 2;
  const success = subStep >= 3;

  return (
    <div style={styles.sceneCenter}>
      {/* CARD */}
      <div
        style={{
          ...styles.card,
          opacity: success && dissolving ? undefined : 1,
        }}
      >
        {/* Swedbank logo */}
        <div style={styles.logo}>Swedbank</div>

        <div style={styles.cardTitle}>Transfer Confirmation</div>

        <div style={styles.separator} />

        {/* From */}
        <div style={styles.fieldRow}>
          <span style={styles.fieldLabel}>From</span>
          <span style={styles.fieldValue}>
            J&#257;nis B&#275;rzi&#326;&scaron; &mdash; LV80HABA...
          </span>
        </div>

        {/* To */}
        <div style={styles.fieldRow}>
          <span style={styles.fieldLabel}>To</span>
          <span style={styles.fieldValue}>
            Unknown Account &mdash; EE382200...
          </span>
        </div>

        <div style={styles.separator} />

        {/* Amount */}
        <div
          style={{
            ...styles.amount,
            opacity: dissolving ? 0 : 1,
            transition: "opacity 0.6s ease",
            position: "relative" as const,
          }}
        >
          &euro;2,000.00
        </div>

        {/* Particles — only while dissolving */}
        {dissolving && (
          <div style={styles.particleAnchor}>
            {PARTICLES.map((p) => (
              <div
                key={p.id}
                className="particle"
                style={
                  {
                    width: p.size,
                    height: p.size,
                    "--tx": `${p.tx}px`,
                    "--ty": `${p.ty}px`,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        {/* Confirm button */}
        <button
          style={{
            ...styles.confirmBtn,
            ...(confirmed ? styles.confirmBtnPressed : {}),
          }}
        >
          {confirmed ? "CONFIRMED" : "CONFIRM"}
        </button>

        {/* Transfer Successful */}
        {success && (
          <div className="fade-in" style={styles.successText}>
            Transfer Successful &#10003;
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SCENE 1.5 — THE REALIZATION                                      */
/* ================================================================== */
function SceneRealization({ subStep }: { subStep: number }) {
  const showText = subStep >= 0;
  const showGone = subStep >= 1;
  const showStamp = subStep >= 2;

  return (
    <div style={styles.sceneCenter}>
      {/* vignette overlay */}
      <div style={styles.vignette} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center" as const }}>
        {showText && (
          <div className="fade-in" style={styles.realizationLine1}>
            His grandson never called.
          </div>
        )}

        {showGone && (
          <div
            className="fade-in"
            style={{
              ...styles.realizationLine2,
              animationDelay: "0.3s",
            }}
          >
            &euro;2,000 &mdash; GONE.
          </div>
        )}

        {showStamp && (
          <div className="stamp-slam" style={styles.stamp}>
            &#10005;
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  REWIND TRANSITION                                                 */
/* ================================================================== */
function SceneRewind({ subStep }: { subStep: number }) {
  const glitchActive = subStep >= 0;
  const showClock = subStep >= 1;
  const showText = subStep >= 2;

  return (
    <div style={styles.sceneCenter}>
      {/* Scan lines overlay */}
      {glitchActive && <div className="scanlines" style={styles.scanlines} />}

      {/* RGB split / glitch layer */}
      {glitchActive && (
        <div className="glitch-container" style={styles.glitchWrap}>
          <div
            className="glitch-skew"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column" as const,
              gap: 24,
            }}
          >
            {/* VHS tracking bars */}
            <div className="vhs-bar" style={{ ...styles.vhsBar, top: "20%" }} />
            <div className="vhs-bar" style={{ ...styles.vhsBar, top: "55%" }} />
            <div className="vhs-bar" style={{ ...styles.vhsBar, top: "78%" }} />

            {/* Spinning clock */}
            {showClock && (
              <div className="spin-reverse" style={styles.clockIcon}>
                &#128336;
              </div>
            )}

            {/* Main text */}
            {showText && (
              <div className="glitch-text fade-in" style={styles.rewindText}>
                WHAT IF HE HAD FRAUDSHIELD?
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  CSS KEYFRAMES & GLOBAL STYLES                                     */
/* ================================================================== */
const globalCSS = `
  /* Particle dissolve */
  @keyframes particleFly {
    0% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(var(--tx), var(--ty)) scale(0.3);
    }
  }
  .particle {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    background: #ef4444;
    animation: particleFly forwards ease-out;
    pointer-events: none;
    box-shadow: 0 0 6px #ef4444;
  }

  /* Fade in */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in {
    animation: fadeIn 0.8s ease forwards;
    opacity: 0;
  }

  /* Stamp slam */
  @keyframes stampSlam {
    0%   { opacity: 0; transform: scale(5) rotate(-12deg); }
    50%  { opacity: 1; transform: scale(0.9) rotate(-12deg); }
    70%  { transform: scale(1.08) rotate(-12deg); }
    100% { transform: scale(1) rotate(-12deg); }
  }
  .stamp-slam {
    animation: stampSlam 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    opacity: 0;
  }

  /* Scan lines */
  @keyframes scanMove {
    0%   { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }
  .scanlines {
    animation: scanMove 0.3s linear infinite;
  }

  /* VHS tracking bars */
  @keyframes vhsSlide {
    0%, 100% { transform: translateX(-120%); opacity: 0; }
    30%, 70% { transform: translateX(0); opacity: 0.7; }
  }
  .vhs-bar {
    animation: vhsSlide 2.5s ease-in-out infinite;
  }

  /* Glitch skew */
  @keyframes glitchSkew {
    0%   { transform: skew(0deg, 0deg); }
    10%  { transform: skew(-2deg, 1deg) translateX(-4px); }
    20%  { transform: skew(1deg, -1deg) translateX(3px); }
    30%  { transform: skew(0deg, 0deg); }
    50%  { transform: skew(3deg, 0deg) translateX(-6px); }
    60%  { transform: skew(-1deg, 2deg) translateX(2px); }
    80%  { transform: skew(0deg, 0deg); }
    90%  { transform: skew(2deg, -1deg) translateX(4px); }
    100% { transform: skew(0deg, 0deg); }
  }
  .glitch-skew {
    animation: glitchSkew 1.5s infinite;
  }

  /* Reverse spin for clock */
  @keyframes spinReverse {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-720deg); }
  }
  .spin-reverse {
    animation: spinReverse 2s ease-in-out infinite;
  }

  /* Glitch text RGB split */
  .glitch-text {
    position: relative;
  }
  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* We use text-shadow for the RGB split instead */
`;

/* ================================================================== */
/*  INLINE STYLES                                                     */
/* ================================================================== */
const styles: Record<string, React.CSSProperties> = {
  viewport: {
    width: "100vw",
    height: "100vh",
    background: "#1A1A2E",
    overflow: "hidden",
    position: "relative",
    fontFamily:
      "'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#ffffff",
  },
  sceneCenter: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
  },
  counter: {
    position: "fixed",
    bottom: 20,
    right: 28,
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    zIndex: 999,
    textAlign: "right",
    fontFamily: "monospace",
  },

  /* ---- SCENE 1.4 ---- */
  card: {
    width: 480,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "40px 44px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    position: "relative",
    backdropFilter: "blur(12px)",
  },
  logo: {
    fontSize: 28,
    fontWeight: 800,
    color: "#FF6600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 500,
    color: "rgba(255,255,255,0.7)",
  },
  separator: {
    width: "100%",
    height: 1,
    background: "rgba(255,255,255,0.08)",
    margin: "4px 0",
  },
  fieldRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
  },
  fieldLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fieldValue: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  amount: {
    fontSize: 48,
    fontWeight: 700,
    color: "#ffffff",
    margin: "12px 0",
    letterSpacing: -1,
  },
  particleAnchor: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
    zIndex: 10,
  },
  confirmBtn: {
    marginTop: 8,
    padding: "14px 48px",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 2,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    background: "#FF6600",
    color: "#ffffff",
    transition: "all 0.3s ease",
    transform: "translateY(0)",
  },
  confirmBtnPressed: {
    background: "#22c55e",
    transform: "translateY(3px)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
  },
  successText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 600,
    color: "#22c55e",
  },

  /* ---- SCENE 1.5 ---- */
  vignette: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  realizationLine1: {
    fontSize: 52,
    fontWeight: 400,
    color: "#ffffff",
    marginBottom: 28,
    letterSpacing: -0.5,
  },
  realizationLine2: {
    fontSize: 60,
    fontWeight: 800,
    color: "#ef4444",
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  stamp: {
    fontSize: 200,
    fontWeight: 900,
    color: "#ef4444",
    lineHeight: 1,
    filter: "drop-shadow(0 0 40px rgba(239,68,68,0.5))",
  },

  /* ---- REWIND ---- */
  scanlines: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage:
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)",
    backgroundSize: "100% 4px",
    zIndex: 10,
    pointerEvents: "none",
  },
  glitchWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 5,
  },
  vhsBar: {
    position: "absolute",
    left: 0,
    width: "100%",
    height: 6,
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
    pointerEvents: "none",
  },
  clockIcon: {
    fontSize: 80,
    lineHeight: 1,
    filter: "grayscale(1) brightness(2)",
  },
  rewindText: {
    fontSize: 64,
    fontWeight: 900,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    color: "#ffffff",
    textShadow:
      "-3px 0 #00e5ff, 3px 0 #ef4444, 0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(239,68,68,0.3)",
    padding: "0 40px",
  },
};
