import { motion, AnimatePresence } from "framer-motion";

interface LetterBoardProps {
  phrase: string;
  revealed: Set<string>;
}

export default function LetterBoard({ phrase, revealed }: LetterBoardProps) {
  const words = phrase.split(" ");

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
      {words.map((word, wi) => (
        <div key={wi} className="flex gap-1 mr-4">
          {word.split("").map((char, ci) => {
            const isLetter = /[A-Z]/i.test(char);
            const isRevealed = revealed.has(char.toUpperCase());

            return (
              <div
                key={`${wi}-${ci}`}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-md flex items-center justify-center font-display text-lg sm:text-xl border-2 transition-all ${
                  isLetter
                    ? isRevealed
                      ? "bg-tile-filled text-primary-foreground border-tile-border"
                      : "bg-tile-bg border-tile-border"
                    : "bg-transparent border-transparent"
                }`}
              >
                <AnimatePresence>
                  {isLetter && isRevealed && (
                    <motion.span
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
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
