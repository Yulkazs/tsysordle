"use client";

import { useState, useEffect, useCallback } from "react";
import { pickDailyWord, evaluateGuess, type TileState, type GameState } from "@/lib/words";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const WIN_MESSAGES = ["GENIUS", "MAGNIFICENT", "IMPRESSIVE", "SPLENDID", "GREAT", "PHEW"];

type KeyState = Record<string, TileState | undefined>;
interface TileData { letter: string; state: TileState; }

/* ── Imposter Lose Card ──────────────────────────────── */
function ImposterCard({ word, onClose }: { word: string; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(3px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        cursor: "pointer",
      }}
    >
      {/* The image IS the card — word floats on top of it */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(480px, 92vw)",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.85) translateY(30px)",
          transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
          opacity: visible ? 1 : 0,
          cursor: "default",
        }}
      >
        {/* The full imposter image as the card */}
        <img
          src="/imposter.png"
          alt="Imposter"
          style={{
            width: "100%",
            display: "block",
            borderRadius: 16,
          }}
        />

        {/* Word overlaid above the red line.
            The red line sits roughly 47% down the image,
            so we position the text around 28–38% from the top. */}
        <div
          style={{
            position: "absolute",
            top: "28%",
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            pointerEvents: "none",
          }}
        >
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "clamp(9px, 2.2vw, 11px)",
            letterSpacing: "4px",
            color: "rgba(210,60,60,0.6)",
            textTransform: "uppercase",
          }}>
            the word was
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "clamp(32px, 9vw, 48px)",
            fontWeight: 900,
            color: "#cc1111",
            letterSpacing: "6px",
            textShadow: "0 0 20px rgba(220,30,30,0.7), 0 0 40px rgba(180,0,0,0.4)",
            lineHeight: 1,
          }}>
            {word}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            background: "none",
            border: "none",
            color: "rgba(180,40,40,0.5)",
            fontSize: 16,
            cursor: "pointer",
            fontFamily: "monospace",
            lineHeight: 1,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(230,60,60,0.95)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(180,40,40,0.5)")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ── Main Game ───────────────────────────────────────── */
export default function Game({ onBack }: { onBack: () => void }) {
  const [target] = useState<string>(() => pickDailyWord());
  const [guesses, setGuesses] = useState<TileData[][]>(
    Array(MAX_GUESSES).fill(null).map(() =>
      Array(WORD_LENGTH).fill(null).map(() => ({ letter: "", state: "empty" as TileState }))
    )
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [message, setMessage] = useState("");
  const [keyStates, setKeyStates] = useState<KeyState>({});
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [bouncingRow, setBouncingRow] = useState<number | null>(null);
  const [showImposter, setShowImposter] = useState(false);

  const showMessage = (msg: string, duration = 1800) => {
    setMessage(msg);
    if (duration > 0) setTimeout(() => setMessage(""), duration);
  };

  const handleKey = useCallback((key: string) => {
    if (gameState !== "playing" || revealingRow !== null) return;

    if (key === "BACKSPACE") {
      if (currentCol > 0) {
        const next = guesses.map(r => [...r]);
        next[currentRow][currentCol - 1] = { letter: "", state: "empty" };
        setGuesses(next);
        setCurrentCol(c => c - 1);
      }
      return;
    }

    if (key === "ENTER") {
      if (currentCol < WORD_LENGTH) {
        setShakingRow(currentRow);
        setTimeout(() => setShakingRow(null), 500);
        showMessage("not enough letters");
        return;
      }
      const guess = guesses[currentRow].map(t => t.letter).join("");
      const result = evaluateGuess(guess, target);
      setRevealingRow(currentRow);
      const next = guesses.map(r => [...r]);
      result.forEach((state, i) => { next[currentRow][i] = { letter: guess[i], state }; });
      setGuesses(next);

      setTimeout(() => {
        setRevealingRow(null);
        const newKeys: KeyState = { ...keyStates };
        const order: Record<TileState, number> = { correct: 3, present: 2, absent: 1, empty: 0, tbd: 0 };
        result.forEach((state, i) => {
          const l = guess[i];
          if ((order[state] ?? 0) > (order[newKeys[l] ?? "empty"] ?? 0)) newKeys[l] = state;
        });
        setKeyStates(newKeys);

        if (guess === target) {
          setGameState("won");
          setBouncingRow(currentRow);
          showMessage(WIN_MESSAGES[currentRow], 0);
        } else if (currentRow + 1 === MAX_GUESSES) {
          setGameState("lost");
          setTimeout(() => setShowImposter(true), 400);
        } else {
          setCurrentRow(r => r + 1);
          setCurrentCol(0);
        }
      }, WORD_LENGTH * 80 + 350);
      return;
    }

    if (/^[A-Z]$/.test(key) && currentCol < WORD_LENGTH) {
      const next = guesses.map(r => [...r]);
      next[currentRow][currentCol] = { letter: key, state: "tbd" };
      setGuesses(next);
      setCurrentCol(c => c + 1);
    }
  }, [gameState, currentRow, currentCol, guesses, target, keyStates, revealingRow]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const k = e.key.toUpperCase();
      if (k === "BACKSPACE") handleKey("BACKSPACE");
      else if (k === "ENTER") handleKey("ENTER");
      else if (/^[A-Z]$/.test(k)) handleKey(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKey]);

  const getTileStyle = (state: TileState): React.CSSProperties => {
    const base: React.CSSProperties = { borderRadius: 10 };
    if (state === "correct") return { ...base, backgroundImage: "url('/green.png')", backgroundSize: "cover", backgroundPosition: "center", border: "none", color: "#1a3a1a" };
    if (state === "present") return { ...base, backgroundImage: "url('/yellow.png')", backgroundSize: "cover", backgroundPosition: "center", border: "none", color: "#3a2800" };
    if (state === "absent")  return { ...base, background: "#1f1f1f", border: "2px solid #1f1f1f", color: "#555" };
    if (state === "tbd")     return { ...base, background: "transparent", border: "2px solid #888", color: "#fff" };
    return { ...base, background: "transparent", border: "2px solid #2a2a2a", color: "#fff" };
  };

  const getTileClass = (state: TileState, rIdx: number) => {
    let cls = "tile";
    if (state === "tbd") cls += " tbd";
    if (revealingRow === rIdx) cls += " reveal";
    if (bouncingRow === rIdx) cls += " bounce";
    return cls;
  };

  const getKeyStyle = (key: string): React.CSSProperties => {
    const s = keyStates[key];
    if (s === "correct") return { backgroundImage: "url('/green.png')", backgroundSize: "cover", backgroundPosition: "center", color: "#1a3a1a" };
    if (s === "present") return { backgroundImage: "url('/yellow.png')", backgroundSize: "cover", backgroundPosition: "center", color: "#3a2800" };
    if (s === "absent")  return { background: "#1a1a1a", color: "#333" };
    return {};
  };

  const KB_ROWS = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["ENTER","Z","X","C","V","B","N","M","⌫"],
  ];

  return (
    <>
      {showImposter && (
        <ImposterCard word={target} onClose={() => setShowImposter(false)} />
      )}

      <div className="game-root">
        <div className="game-header">
          <button className="back-btn" onClick={onBack}>← back</button>
          <div className="game-title">TSYSORDLE</div>
          <div style={{ width: 70 }} />
        </div>

        <div className="game-sub">5-letter slang · 6 guesses</div>
        <div className="game-msg">{message}</div>

        <div className="game-grid">
          {guesses.map((row, rIdx) => (
            <div key={rIdx} className={`g-row${shakingRow === rIdx ? " shake" : ""}`}>
              {row.map((tile, cIdx) => (
                <div
                  key={cIdx}
                  className={getTileClass(tile.state, rIdx)}
                  style={{
                    ...getTileStyle(tile.state),
                    ...(revealingRow === rIdx ? { animationDelay: `${cIdx * 80}ms` } : {}),
                  }}
                >
                  {tile.letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="game-hint">type on keyboard or tap below</div>

        <div className="game-keyboard">
          {KB_ROWS.map((row, i) => (
            <div key={i} className="kb-row">
              {row.map(k => {
                const keyVal = k === "⌫" ? "BACKSPACE" : k;
                const isWide = k.length > 1;
                return (
                  <button
                    key={k}
                    className={`g-key${isWide ? " wide" : ""}`}
                    style={k.length === 1 ? getKeyStyle(k) : {}}
                    onClick={() => handleKey(keyVal)}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}