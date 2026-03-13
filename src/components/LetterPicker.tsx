interface LetterPickerProps {
  usedLetters: Set<string>;
  onPick: (letter: string) => void;
  disabled: boolean;
}

const ROWS = [
  "ABCDEFGHIJKLM".split(""),
  "NOPQRSTUVWXYZ".split(""),
  "ÀÁÂÃÇÉÊÍÓÔÕÚ".split(""),
];

export default function LetterPicker({ usedLetters, onPick, disabled }: LetterPickerProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 max-w-lg mx-auto">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex flex-wrap justify-center gap-1.5">
          {row.map((letter) => {
            const used = usedLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => onPick(letter)}
                disabled={disabled || used}
                className={`w-8 h-8 rounded font-display text-xs flex items-center justify-center transition-all ${
                  used
                    ? "bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
                    : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground active:scale-90"
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
