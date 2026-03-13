import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Wheel, { WheelSegment } from "@/components/Wheel";
import LetterBoard from "@/components/LetterBoard";
import LetterPicker from "@/components/LetterPicker";

const PHRASES = [
  "WHEEL OF FORTUNE",
  "GOOD MORNING",
  "TROPICAL PARADISE",
  "AROUND THE WORLD",
  "LIVING THE DREAM",
  "CHAMPIONSHIP GAME",
  "BEAUTIFUL SUNSET",
  "MOUNTAIN ADVENTURE",
];

type GamePhase = "spin" | "guess" | "result";

export default function Index() {
  const [phrase, setPhrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("spin");
  const [lastResult, setLastResult] = useState<WheelSegment | null>(null);
  const [message, setMessage] = useState("Spin the wheel to start!");

  const phraseLetters = new Set(phrase.replace(/[^A-Z]/gi, "").toUpperCase().split(""));
  const allRevealed = [...phraseLetters].every((l) => revealed.has(l));

  const handleResult = useCallback((segment: WheelSegment) => {
    setLastResult(segment);
    if (segment.value === 0) {
      setScore(0);
      setMessage("💥 BANKRUPT! You lost it all!");
      setPhase("spin");
    } else if (segment.value === -1) {
      setMessage("⏭️ Skip! You lose this turn.");
      setPhase("spin");
    } else {
      setMessage(`You landed on ${segment.label}! Pick a letter.`);
      setPhase("guess");
    }
  }, []);

  const handleLetterPick = useCallback(
    (letter: string) => {
      setUsedLetters((prev) => new Set(prev).add(letter));
      const upper = letter.toUpperCase();
      const count = phrase.toUpperCase().split("").filter((c) => c === upper).length;

      if (count > 0 && lastResult) {
        const earned = count * lastResult.value;
        setScore((prev) => prev + earned);
        setRevealed((prev) => new Set(prev).add(upper));
        setMessage(`🎉 "${letter}" appears ${count} time(s)! +$${earned}`);
      } else {
        setMessage(`❌ No "${letter}" in the puzzle.`);
      }
      setPhase("spin");
    },
    [phrase, lastResult]
  );

  const resetGame = () => {
    const newPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setPhrase(newPhrase);
    setRevealed(new Set());
    setUsedLetters(new Set());
    setScore(0);
    setPhase("spin");
    setLastResult(null);
    setMessage("Spin the wheel to start!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6 gap-6 overflow-auto">
      {/* Title */}
      <h1 className="font-display text-3xl sm:text-4xl text-primary glow-gold tracking-wide text-center">
        Wheel of Fortune
      </h1>

      {/* Score */}
      <div className="bg-card border border-border rounded-lg px-8 py-3 text-center">
        <p className="text-muted-foreground text-sm font-body">SCORE</p>
        <p className="font-display text-3xl text-primary">${score.toLocaleString()}</p>
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-foreground font-body text-lg text-center max-w-md"
        >
          {message}
        </motion.p>
      </AnimatePresence>

      {/* Letter Board */}
      <LetterBoard phrase={phrase} revealed={revealed} />

      {allRevealed ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="font-display text-2xl text-primary glow-gold">🎊 YOU SOLVED IT! 🎊</p>
          <button
            onClick={resetGame}
            className="font-display text-lg px-8 py-3 rounded-lg bg-accent text-accent-foreground hover:brightness-110 transition-all"
          >
            NEW GAME
          </button>
        </motion.div>
      ) : (
        <>
          {/* Wheel */}
          <Wheel onResult={handleResult} spinning={spinning} setSpinning={setSpinning} />

          {/* Letter Picker */}
          {phase === "guess" && !spinning && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-center text-muted-foreground mb-2 font-body">Pick a letter:</p>
              <LetterPicker usedLetters={usedLetters} onPick={handleLetterPick} disabled={spinning} />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
