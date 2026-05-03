export const WORD_LIST: string[] = [
  "BITCH", "PRICK", "PUSSY", "SHITE", "WHORE", "TWATS", "ARSES", "BALLS",
  "TURDS", "DICKS", "CUNTS", "WANKR", "NIGGA", "SLUTT", "CRAPP", "FUCKR",
  
  "FANNY", "CHODE", "COCKY", "BONER", "MINGE", "SHAGS", "KNOCK", "PISSY",
  "POOFS", "DILDO", "FAGGY", "SKANK", "SMEEG", "MORON", "COOTS", "BUSSY",

  "JERKS", "DORKS", "MORON", "IDOTS", "DWEEB", "WIMPS", "LAMES", "CLOWN",
  "GOOFS", "PANSY", "TRAMP", "CRANK", "SKANK", "CREEP", "FREAK", "LOSER",

  "RATIO", "CLOUT", "BASED", "SIMPS", "MUNCH", "GOONE", "CRUNK", "FLEXY",
  "SWOLL", "ZOOOM", "CAPIN", "SLAPS", "YEETS", "NOOBS", "GOONS", "SALTY",

  "DUMMY", "DIPPY", "DENSE", "THICK", "SCUMS", "PIGGY", "RATTY", "SNAKE",
  "SLIMY", "MOOCH", "GONGS", "MUPPT", "TWITS", "DUMBO", "SKEEZ", "DOUCH",

  "BUTTS", "DONGZ", "JISMS", "TWINK", "KNOBS", "SHAFT", "GOOCH", "MUFFS",
  "SACKY", "CACKY", "DUMPY", "WANGS", "CLITS", "SHITS", "CRAPS", "HELLS",
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