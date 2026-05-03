"use client";

import { useState } from "react";
import Game from "@/components/GameBoard";

export default function Home() {
  const [started, setStarted] = useState(false);

  if (started) return <Game onBack={() => setStarted(false)} />;

  return (
    <div className="splash">
      <div className="splash-title">tsysordle</div>
      <button className="start-btn" onClick={() => setStarted(true)}>
        Start Game
      </button>
      <p className="splash-warning">
        <strong>Warning:</strong> This game contains slang and potentially offensive language.
        <br />Some words may be inappropriate or insensitive. Player discretion is advised.
      </p>
    </div>
  );
}