"use client";

import { useState } from "react";
import Game from "@/components/Game";

export default function Home() {
  const [started, setStarted] = useState(false);

  if (started) return <Game />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Monigue&family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');

        .splash {
          background: #111;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          font-family: 'Space Mono', monospace;
        }

        .splash-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 10vw, 96px);
          letter-spacing: 6px;
          color: #b8d8f0;
          line-height: 1;
          text-shadow: 0 0 40px rgba(120,190,255,0.3);
        }

        .start-btn {
          background: #5aabf0;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px 40px;
          font-size: 18px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 1px;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 4px 24px rgba(90,171,240,0.25);
        }

        .start-btn:hover {
          background: #3d9ae8;
          transform: translateY(-2px);
        }

        .start-btn:active { transform: translateY(0); }

        .warning {
          position: absolute;
          bottom: 60px;
          text-align: center;
          font-size: 12px;
          color: #555;
          line-height: 1.6;
          max-width: 420px;
          padding: 0 24px;
        }

        .warning strong { color: #777; }
      `}</style>

      <div className="splash">
        <div className="splash-title">tsysordle</div>
        <button className="start-btn" onClick={() => setStarted(true)}>
          Start Game
        </button>
        <p className="warning">
          <strong>Warning:</strong> This game contains slang and potentially offensive language.
          <br />Some words may be inappropriate or insensitive. Player discretion is advised.
        </p>
      </div>
    </>
  );
}