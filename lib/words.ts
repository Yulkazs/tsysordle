export const WORD_LIST: string[] = [
  "SUSSY", "RIZZY", "SIGMA", "GYATT", "DRIPP", "SKIBI", "POGGY", "SALTY",
  "THICC", "VIBEN", "BASED", "GOATD", "LOWKY", "NOCAP", "SLAYY", "VIBEY",
  "FANUM", "GRIND", "SWAGD", "FLEXY", "RATIO", "CLOUT", "NIGGA", "CRACKA",
  "HONKY", "POCHO", "GYPPO", "CHINK", "PADDY", "DOTTY", "YEETS", "SLAPS",
  "FLEEK", "DRIPS", "WAVES", "MUNCH", "BUSSY", "GOONE", "CRUNK", "SWERV",
  "SWOLE", "ZOOMS", "SIMPS", "CLAPS", "EDGED", "LOWFI", "GRINGO",
]
  .filter((w) => w.length === 5)
  .map((w) => w.toUpperCase());

export const VALID_GUESSES = [...new Set(WORD_LIST)];

export function pickDailyWord(): string {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return VALID_GUESSES[seed % VALID_GUESSES.length];
}

export type TileState = "empty" | "tbd" | "correct" | "present" | "absent";
export type GameState  = "playing" | "won" | "lost";

export interface Tile {
  letter: string;
  state:  TileState;
  reveal: boolean;
}

export function evaluateGuess(guess: string, target: string): TileState[] {
  const result: TileState[]  = Array(5).fill("absent");
  const targetArr = target.split("");
  const guessArr  = guess.split("");
  const usedTarget = Array(5).fill(false);
  const usedGuess  = Array(5).fill(false);

  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i]    = "correct";
      usedTarget[i] = true;
      usedGuess[i]  = true;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (usedGuess[i]) continue;
    for (let j = 0; j < 5; j++) {
      if (!usedTarget[j] && guessArr[i] === targetArr[j]) {
        result[i]    = "present";
        usedTarget[j] = true;
        break;
      }
    }
  }
  return result;
}