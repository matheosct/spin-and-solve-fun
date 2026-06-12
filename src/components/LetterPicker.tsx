interface LetterPickerProps {
  usedLetters: Set<string>;
  onPick: (letter: string) => void;
  disabled: boolean;
}

const ROWS = [
  "ABCDEFGHIJKLM".split(""),
  "NOPQRSTUVWXYZ".split(""),
];

export default function LetterPicker({ usedLetters, onPick, disabled }: LetterPickerProps) {
  return (
    <div className="flex flex-col items-center gap-2 max-w-xl mx-auto">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex flex-wrap justify-center gap-1.5">
          {row.map((letter) => {
            const used = usedLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => onPick(letter)}
                disabled={disabled || used}
                className={`w-9 h-10 sm:w-10 sm:h-11 rounded-xl font-display text-sm flex items-center justify-center transition-all border ${
                  used
                    ? "bg-muted text-muted-foreground/40 border-transparent cursor-not-allowed"
                    : "bg-card text-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-soft active:scale-95"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
