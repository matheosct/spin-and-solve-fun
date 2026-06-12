import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, X, Check } from "lucide-react";

interface SolvePuzzleProps {
  onSolve: (guess: string) => void;
  onCancel: () => void;
}

export default function SolvePuzzle({ onSolve, onCancel }: SolvePuzzleProps) {
  const [guess, setGuess] = useState("");

  const handleSubmit = () => {
    if (guess.trim()) onSolve(guess.trim().toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-soft flex flex-col items-center gap-4 w-full max-w-md mx-auto"
    >
      <div className="flex items-center gap-2 text-foreground">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Lightbulb className="text-accent" size={18} />
        </div>
        <span className="font-medium">Digite sua resposta</span>
      </div>

      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        autoFocus
        placeholder="Sua resposta..."
        className="w-full bg-secondary border border-transparent rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground font-display text-lg text-center focus:outline-none focus:border-ring focus:bg-card transition-colors"
      />

      <div className="flex gap-2 w-full">
        <button
          onClick={handleSubmit}
          className="flex-1 font-medium text-sm px-5 py-3 rounded-2xl bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-soft hover:shadow-hover flex items-center justify-center gap-2"
        >
          <Check size={16} /> Resolver
        </button>
        <button
          onClick={onCancel}
          className="font-medium text-sm px-5 py-3 rounded-2xl bg-secondary text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
        >
          <X size={16} /> Cancelar
        </button>
      </div>
    </motion.div>
  );
}
