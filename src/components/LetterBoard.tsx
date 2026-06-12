import { motion, AnimatePresence } from "framer-motion";

interface LetterBoardProps {
  phrase: string;
  revealed: Set<string>;
}

export default function LetterBoard({ phrase, revealed }: LetterBoardProps) {
  const words = phrase.split(" ");

  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
      {words.map((word, wi) => (
        <div key={wi} className="flex gap-1.5">
          {word.split("").map((char, ci) => {
            const isLetter = /[A-ZÀ-ÿ]/i.test(char);
            const isRevealed = revealed.has(char.toUpperCase());

            return (
              <div
                key={`${wi}-${ci}`}
                className={`w-9 h-11 sm:w-10 sm:h-12 rounded-xl flex items-center justify-center font-display text-base sm:text-lg border transition-all ${
                  isLetter
                    ? isRevealed
                      ? "bg-primary text-primary-foreground border-primary shadow-soft"
                      : "bg-secondary border-border text-transparent"
                    : "bg-transparent border-transparent"
                }`}
              >
                <AnimatePresence>
                  {isLetter && isRevealed && (
                    <motion.span
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ duration: 0.35 }}
                    >
                      {char.toUpperCase()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
