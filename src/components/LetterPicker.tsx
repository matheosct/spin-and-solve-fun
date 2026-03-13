interface LetterPickerProps {
  usedLetters: Set<string>;
  onPick: (letter: string) => void;
  disabled: boolean;
}

export default function LetterPicker({ usedLetters, onPick, disabled }: LetterPickerProps) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto">
      {alphabet.map((letter) => {
        const used = usedLetters.has(letter);
        return (
          <button
            key={letter}
            onClick={() => onPick(letter)}
            disabled={disabled || used}
            className={`w-9 h-9 rounded font-display text-sm flex items-center justify-center transition-all ${
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
  );
}
