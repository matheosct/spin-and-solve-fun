import { useState } from "react";
import { motion } from "framer-motion";

interface SolvePuzzleProps {
  onSolve: (guess: string) => void;
  onCancel: () => void;
}

export default function SolvePuzzle({ onSolve, onCancel }: SolvePuzzleProps) {
  const [guess, setGuess] = useState("");

  const handleSubmit = () => {
    if (guess.trim()) {
      onSolve(guess.trim().toUpperCase());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 w-full max-w-md mx-auto"
    >
      <p className="font-body text-foreground text-sm">Digite sua resposta:</p>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        autoFocus
        placeholder="Sua resposta..."
        className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground font-display text-lg text-center focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="font-display text-sm px-6 py-2 rounded-lg bg-accent text-accent-foreground hover:brightness-110 transition-all"
        >
          RESOLVER
        </button>
        <button
          onClick={onCancel}
          className="font-display text-sm px-6 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          CANCELAR
        </button>
      </div>
    </motion.div>
  );
}
