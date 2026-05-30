import React, { useEffect, useState, useRef } from "react";

const LOGO_URL =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6929fb00a7a87c74088419c3/b0f82202f_kode-base-logo-white.png";

const FULL_LINES = [
  { text: "$ ssh kodebase@launch.kodebase.us", delay: 0, typing: true },
  { text: "Connecting to kodebase.us port 443...", delay: 400, typing: false },
  { text: "Connection established.", delay: 700, typing: false },
  { text: "Authenticating with public key \"willkode@kodebase\"...", delay: 900, typing: false },
  { text: "Authenticated.", delay: 1200, typing: false, color: "text-emerald-400" },
  { text: "Loading KodeBase environment...", delay: 1400, typing: false },
];

const QUICK_LINES = [
  { text: "$ kodebase --resume", delay: 0, typing: true },
  { text: "Session restored.", delay: 200, typing: false, color: "text-emerald-400" },
  { text: "Loading...", delay: 300, typing: false },
];

export default function GlitchPreloader({ onComplete, quick = false }) {
  const LINES = quick ? QUICK_LINES : FULL_LINES;
  const TOTAL_DURATION = quick ? 500 : 2100;
  const FADE_DURATION = quick ? 150 : 250;
  const PROGRESS_START = quick ? 300 : 1400;
  const PROGRESS_END = TOTAL_DURATION;
  const [visibleLines, setVisibleLines] = useState([]);
  const [typedText, setTypedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const startRef = useRef(null);
  const frameRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    startRef.current = start;

    const tick = (now) => {
      const elapsed = now - start;

      // Reveal lines based on delay
      const ready = LINES.filter((l) => elapsed >= l.delay);
      setVisibleLines(ready);

      // Type the first line character by character
      if (LINES[0] && elapsed < LINES[0].delay + LINES[0].text.length * 28 + 200) {
        const typingElapsed = Math.max(0, elapsed - LINES[0].delay);
        const chars = Math.min(LINES[0].text.length, Math.floor(typingElapsed / 28));
        setTypedText(LINES[0].text.slice(0, chars));
      } else {
        setTypedText(LINES[0].text);
      }

      // Progress bar
      if (elapsed >= PROGRESS_START) {
        const p = Math.min(100, ((elapsed - PROGRESS_START) / (PROGRESS_END - PROGRESS_START)) * 100);
        setProgress(p);
      }

      // Fade out
      if (elapsed >= TOTAL_DURATION && !fading) {
        setFading(true);
        setTimeout(() => onComplete && onComplete(), FADE_DURATION);
      }

      if (elapsed < TOTAL_DURATION + FADE_DURATION) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines]);

  // Glitch state
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 120 + Math.random() * 180);
    };
    const id = setInterval(trigger, 900 + Math.random() * 1250);
    trigger();
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#0a0e1a] flex items-center justify-center p-4 overflow-hidden"
      style={{
        transition: `opacity ${FADE_DURATION}ms ease-out`,
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* Scanlines overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[10000]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
        }}
      />

      {/* Screen flicker */}
      {glitchActive && (
        <div
          className="pointer-events-none fixed inset-0 z-[10001]"
          style={{ backgroundColor: "rgba(255,60,60,0.04)" }}
        />
      )}

      <div
        className="w-full max-w-lg"
        style={{
          transform: glitchActive ? `translate(${Math.random() > 0.5 ? 2 : -2}px, ${Math.random() > 0.5 ? 1 : -1}px)` : "none",
          transition: glitchActive ? "none" : "transform 0.1s",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <img src={LOGO_URL} alt="KodeBase" className="h-8 w-auto" />
          <span
            className="text-lg font-black uppercase tracking-wide"
            style={{ fontFamily: '"Saira Semi Condensed", sans-serif' }}
          >
            <span className="text-white">Kode</span>
            <span className="text-red-500">Base</span>
          </span>
        </div>

        {/* Terminal window */}
        <div className="rounded-lg overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111827] border-b border-white/5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/40" />
            <span className="ml-3 text-[11px] text-gray-500 font-mono">
              kodebase — ssh
            </span>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalRef}
            className="bg-[#080c14] px-4 py-4 font-mono text-[12px] sm:text-[13px] leading-relaxed min-h-[200px] max-h-[280px] overflow-y-auto relative"
          >
            {/* Glitch bar */}
            {glitchActive && (
              <div
                className="absolute left-0 right-0 h-[2px] bg-red-500/30 pointer-events-none z-10"
                style={{ top: `${20 + Math.random() * 60}%` }}
              />
            )}
            {visibleLines.map((line, i) => (
              <div key={i} className={`${line.color || "text-gray-300"} mb-1`}>
                {i === 0 ? (
                  <span
                    style={glitchActive && Math.random() > 0.5 ? {
                      textShadow: "2px 0 #ff0000, -2px 0 #00ffff",
                    } : undefined}
                  >
                    {typedText}
                    {typedText.length < line.text.length && (
                      <span className="inline-block w-2 h-4 bg-gray-300 ml-0.5 animate-pulse align-middle" />
                    )}
                  </span>
                ) : (
                  <span
                    className="text-gray-400"
                    style={glitchActive && Math.random() > 0.7 ? {
                      textShadow: "1px 0 #ff0000, -1px 0 #00ffff",
                      transform: `translateX(${Math.random() > 0.5 ? 3 : -3}px)`,
                      display: "inline-block",
                    } : undefined}
                  >
                    {line.text}
                  </span>
                )}
              </div>
            ))}

            {/* Progress bar */}
            {progress > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                  <span>Loading environment</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {progress >= 100 && (
                  <div className="text-emerald-400 mt-2 text-[12px]">
                    ✓ Ready. Welcome to KodeBase.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}