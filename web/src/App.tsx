import { useState } from "react";
import { GameShell, GameTopbar, GameAuth } from "@freegamestore/games";

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

interface Card {
  rank: (typeof RANKS)[number];
  suit: (typeof SUITS)[number];
}

function newCard(): Card {
  return {
    rank: RANKS[Math.floor(Math.random() * RANKS.length)]!,
    suit: SUITS[Math.floor(Math.random() * SUITS.length)]!,
  };
}

function rankValue(r: Card["rank"]): number {
  return RANKS.indexOf(r) + 1;
}

function CardView({ card }: { card: Card }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <div
      style={{
        width: "min(140px, 28vw)",
        height: "min(200px, 26svh)",
        border: "1px solid var(--line-strong)",
        borderRadius: "0.85rem",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "0.5rem 0.75rem",
        fontFamily: "Fraunces, serif",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
      }}
    >
      <span style={{ fontSize: "clamp(1rem, 2.5svh, 1.4rem)", fontWeight: 700, lineHeight: 1.1, color: isRed ? "#dc2626" : "var(--ink)" }}>
        {card.rank}
        <br />
        {card.suit}
      </span>
      <span
        style={{
          fontSize: "clamp(1.6rem, 5svh, 3.2rem)",
          color: isRed ? "#dc2626" : "var(--ink)",
          alignSelf: "center",
          lineHeight: 1,
        }}
      >
        {card.suit}
      </span>
      <span
        style={{
          fontSize: "clamp(1rem, 2.5svh, 1.4rem)",
          fontWeight: 700,
          lineHeight: 1.1,
          color: isRed ? "#dc2626" : "var(--ink)",
          textAlign: "right",
          transform: "rotate(180deg)",
        }}
      >
        {card.rank}
        <br />
        {card.suit}
      </span>
    </div>
  );
}

type GameState = "playing" | "lost";

export default function App() {
  const [current, setCurrent] = useState<Card>(() => newCard());
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [state, setState] = useState<GameState>("playing");
  const [hint, setHint] = useState<string | null>(null);

  function guess(direction: "higher" | "lower") {
    const next = newCard();
    const cur = rankValue(current.rank);
    const nxt = rankValue(next.rank);
    let correct: boolean;
    if (cur === nxt) {
      // tie counts as a free pass
      setHint("Tie — try again with the same card.");
      setCurrent(next);
      return;
    } else if (direction === "higher") {
      correct = nxt > cur;
    } else {
      correct = nxt < cur;
    }

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
      setHint(`${next.rank}${next.suit} — ${direction}, nice.`);
      setCurrent(next);
    } else {
      setHint(`${next.rank}${next.suit} — ${direction === "higher" ? "lower" : "higher"} than ${current.rank}${current.suit}.`);
      setCurrent(next);
      setState("lost");
    }
  }

  function reset() {
    setCurrent(newCard());
    setStreak(0);
    setHint(null);
    setState("playing");
  }

  return (
    <GameShell
      topbar={
        <GameTopbar
          title="High / Low"
          stats={[
            { label: "Streak", value: streak, accent: true },
            { label: "Best", value: best },
          ]}
          actions={<GameAuth />}
          rules={<div><h3 style={{fontWeight:700}}>High / Low</h3><h4 style={{fontWeight:600}}>Rules</h4><ul><li>A card is shown</li><li>Guess if the next card will be higher or lower</li><li>Build a streak</li><li>Wrong guess = game over</li><li>Ties are a free pass</li></ul></div>}
        />
      }
    >
      <div className="relative w-full h-full overflow-y-auto">
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "0.5rem 0", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", marginBottom: "0.5rem", fontSize: "0.8rem" }}>
            Will the next card be higher or lower? Build a streak.
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
            <CardView card={current} />
          </div>

          {hint && (
            <p style={{ color: "var(--muted)", marginBottom: "0.5rem", minHeight: "1.3em", fontSize: "0.85rem" }}>{hint}</p>
          )}

          {state === "playing" ? (
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => guess("lower")} style={primaryButton}>
                ↓ Lower
              </button>
              <button type="button" onClick={() => guess("higher")} style={primaryButton}>
                ↑ Higher
              </button>
            </div>
          ) : (
            <div>
              <p
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                }}
              >
                Game over — streak {streak}.
              </p>
              <button type="button" onClick={reset} style={primaryButton}>
                Play again
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
            <Stat label="Streak" value={streak} />
            <Stat label="Best" value={best} />
          </div>
        </div>
      </div>
    </GameShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: "clamp(1.2rem, 3svh, 1.6rem)", fontWeight: 700 }}>{value}</div>
      <div
        style={{
          color: "var(--muted)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  background: "var(--accent)",
  color: "white",
  border: 0,
  padding: "0.5rem 1.4rem",
  borderRadius: "0.75rem",
  fontFamily: "inherit",
  fontWeight: 700,
  fontSize: "0.9rem",
  cursor: "pointer",
  minWidth: "100px",
  minHeight: "2.75rem",
};
