"use client";

import { useState, useEffect, useCallback } from "react";
import { pickDailyWord, evaluateGuess, type TileState, type GameState } from "@/lib/words";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const WIN_MESSAGES = ["GENIUS", "MAGNIFICENT", "IMPRESSIVE", "SPLENDID", "GREAT", "PHEW"];

type KeyState = Record<string, TileState | undefined>;
interface TileData { letter: string; state: TileState; }

export default function Game() {
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
          showMessage(target, 0);
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
    const base: React.CSSProperties = { borderRadius: 8 };
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');

        .game-root {
          background: #111;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 12px 40px;
          font-family: 'Space Mono', monospace;
          color: #eee;
        }

        .game-header {
          width: 100%;
          max-width: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding-bottom: 14px;
          border-bottom: 1px solid #222;
          margin-bottom: 8px;
        }

        .game-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 40px;
          letter-spacing: 6px;
          color: #fff;
          line-height: 1;
        }

        .game-sub {
          font-size: 9px;
          letter-spacing: 3px;
          color: #444;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        #msg {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 2px;
          min-height: 26px;
          margin-bottom: 12px;
          color: #FFE566;
          text-align: center;
        }

        #grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .row { display: flex; gap: 8px; }

        .tile {
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 38px;
          user-select: none;
        }

        .tile.tbd { animation: pop .1s ease; }
        .tile.reveal { animation: flip .35s ease forwards; }
        .tile.bounce { animation: bounce .5s ease; }

        @keyframes pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes flip {
          0%   { transform: rotateX(0); }
          50%  { transform: rotateX(-90deg); }
          100% { transform: rotateX(0); }
        }
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          30%     { transform: translateY(-10px); }
        }

        .shake { animation: shake .4s ease; }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-7px); }
          40%,80% { transform: translateX(7px); }
        }

        .hint { font-size: 9px; color: #333; letter-spacing: 1px; margin-bottom: 10px; }

        #keyboard { display: flex; flex-direction: column; gap: 6px; align-items: center; }
        .kb-row { display: flex; gap: 5px; }

        .key {
          min-width: 36px;
          height: 50px;
          padding: 0 6px;
          background: #2a2a2a;
          border: none;
          color: #ccc;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
          letter-spacing: 1px;
        }

        .key:hover { background: #3a3a3a; }
        .key.wide { min-width: 58px; font-size: 9px; }
      `}</style>

      <div className="game-root">
        <div className="game-header">
          <div className="game-title">TSYSORDLE</div>
        </div>

        <div className="game-sub">5-letter slang · 6 guesses</div>
        <div id="msg">{message}</div>

        <div id="grid">
          {guesses.map((row, rIdx) => (
            <div key={rIdx} className={`row${shakingRow === rIdx ? " shake" : ""}`}>
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

        <div className="hint">type on keyboard or tap below</div>

        <div id="keyboard">
          {KB_ROWS.map((row, i) => (
            <div key={i} className="kb-row">
              {row.map(k => {
                const keyVal = k === "⌫" ? "BACKSPACE" : k;
                const isWide = k.length > 1;
                return (
                  <button
                    key={k}
                    className={`key${isWide ? " wide" : ""}`}
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