import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Trophy, ArrowLeft } from "lucide-react";
import Wheel, { WheelSegment } from "@/components/Wheel";
import LetterBoard from "@/components/LetterBoard";
import LetterPicker from "@/components/LetterPicker";
import SolvePuzzle from "@/components/SolvePuzzle";
import PhraseManager from "@/components/PhraseManager";

const DEFAULT_PHRASES = [
  "RODA DA FORTUNA",
  "BOM DIA",
  "PARAÍSO TROPICAL",
  "AO REDOR DO MUNDO",
  "VIVENDO O SONHO",
  "JOGO DE CAMPEONATO",
  "PÔR DO SOL LINDO",
  "AVENTURA NA MONTANHA",
  "CORAÇÃO VALENTE",
  "MÚSICA BRASILEIRA",
];

// Normalize: strip accents for matching purposes
function normalize(char: string): string {
  return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

// Get all unique base + accented characters in a phrase
function getPhraseLetters(phrase: string): Set<string> {
  const chars = phrase.toUpperCase().split("").filter((c) => /[A-ZÀ-ÿ]/i.test(c));
  return new Set(chars);
}

interface Player {
  name: string;
  score: number;
}

type GamePhase = "setup" | "spin" | "guess" | "solve" | "result";

export default function Index() {
  const [players, setPlayers] = useState<Player[]>([
    { name: "Jogador 1", score: 0 },
    { name: "Jogador 2", score: 0 },
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState("");

  const [phrases, setPhrases] = useState<string[]>(DEFAULT_PHRASES);
  const [phrase, setPhrase] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [lastResult, setLastResult] = useState<WheelSegment | null>(null);
  const [message, setMessage] = useState("Configure os jogadores e comece!");
  const [showPhraseManager, setShowPhraseManager] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const phraseLetters = getPhraseLetters(phrase);
  // Check if all letters are revealed (match by normalized form)
  const allRevealed = phrase !== "" && [...phraseLetters].every((l) => revealed.has(l));

  const nextTurn = useCallback(() => {
    setCurrentPlayer((prev) => (prev + 1) % players.length);
  }, [players.length]);

  const goBackToMenu = () => {
    setGameStarted(false);
    setPhase("setup");
    setSpinning(false);
    setWinner(null);
    setMessage("Configure os jogadores e comece!");
  };

  const startGame = () => {
    if (players.length < 1) return;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setPhrase(randomPhrase);
    setRevealed(new Set());
    setUsedLetters(new Set());
    setPhase("spin");
    setWinner(null);
    setCurrentPlayer(0);
    setMessage(`Vez de ${players[0].name}! Gire a roleta!`);
    setGameStarted(true);
  };

  const handleResult = useCallback(
    (segment: WheelSegment) => {
      setLastResult(segment);
      const name = players[currentPlayer].name;
      if (segment.value === 0) {
        setPlayers((prev) =>
          prev.map((p, i) => (i === currentPlayer ? { ...p, score: 0 } : p))
        );
        setMessage(`💥 FALIU! ${name} perdeu tudo!`);
        nextTurn();
        setTimeout(() => {
          setMessage(`Vez de ${players[(currentPlayer + 1) % players.length].name}! Gire a roleta!`);
          setPhase("spin");
        }, 1500);
      } else if (segment.value === -1) {
        setMessage(`⏭️ ${name} passou a vez!`);
        nextTurn();
        setTimeout(() => {
          setMessage(`Vez de ${players[(currentPlayer + 1) % players.length].name}! Gire a roleta!`);
          setPhase("spin");
        }, 1500);
      } else {
        setMessage(`${name} parou em ${segment.label}! Escolha uma letra.`);
        setPhase("guess");
      }
    },
    [currentPlayer, players, nextTurn]
  );

  const handleLetterPick = useCallback(
    (letter: string) => {
      setUsedLetters((prev) => new Set(prev).add(letter));
      const upper = letter.toUpperCase();
      const normalizedPick = normalize(upper);

      // Find all chars in phrase that match (either exact or by normalized form)
      const phraseChars = phrase.toUpperCase().split("");
      const matchingChars = phraseChars.filter(
        (c) => c === upper || normalize(c) === normalizedPick
      );
      const count = matchingChars.length;
      const name = players[currentPlayer].name;

      if (count > 0 && lastResult) {
        const earned = count * lastResult.value;
        setPlayers((prev) =>
          prev.map((p, i) => (i === currentPlayer ? { ...p, score: p.score + earned } : p))
        );
        // Reveal all matching characters (including accented variants)
        setRevealed((prev) => {
          const next = new Set(prev);
          next.add(upper);
          matchingChars.forEach((c) => next.add(c));
          return next;
        });
        setMessage(`🎉 "${letter}" aparece ${count} vez(es)! ${name} +R$${earned}`);
        setPhase("spin");
      } else {
        setMessage(`❌ Não tem "${letter}". Vez do próximo!`);
        nextTurn();
        setTimeout(() => {
          setMessage(`Vez de ${players[(currentPlayer + 1) % players.length].name}! Gire a roleta!`);
          setPhase("spin");
        }, 1200);
      }
    },
    [phrase, lastResult, currentPlayer, players, nextTurn]
  );

  const handleSolve = useCallback(
    (guess: string) => {
      const normalizedGuess = guess.toUpperCase();
      const normalizedPhrase = phrase.toUpperCase();
      if (normalizedGuess === normalizedPhrase) {
        const w = players[currentPlayer];
        setWinner(w);
        setRevealed(new Set(normalizedPhrase.split("")));
        setMessage(`🎊 ${w.name} resolveu! Parabéns!`);
        setPhase("result");
      } else {
        setMessage(`❌ Resposta errada! ${players[currentPlayer].name} perde a vez.`);
        nextTurn();
        setTimeout(() => {
          setMessage(`Vez de ${players[(currentPlayer + 1) % players.length].name}! Gire a roleta!`);
          setPhase("spin");
        }, 1500);
      }
    },
    [phrase, currentPlayer, players, nextTurn]
  );

  const resetGame = () => {
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setPhrase(randomPhrase);
    setRevealed(new Set());
    setUsedLetters(new Set());
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
    setPhase("spin");
    setLastResult(null);
    setWinner(null);
    setCurrentPlayer(0);
    setMessage(`Vez de ${players[0].name}! Gire a roleta!`);
  };

  const addPlayer = () => {
    const name = playerNameInput.trim() || `Jogador ${players.length + 1}`;
    setPlayers((prev) => [...prev, { name, score: 0 }]);
    setPlayerNameInput("");
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  // SETUP SCREEN
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 gap-6">
        <h1 className="font-display text-4xl sm:text-5xl text-primary glow-gold tracking-wide text-center">
          Roda da Fortuna
        </h1>
        <p className="text-muted-foreground font-body text-lg">Configure os jogadores</p>

        <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-4">
          <div className="space-y-2">
            {players.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                <span className="font-body text-foreground">{p.name}</span>
                {players.length > 2 && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="text-muted-foreground hover:text-destructive text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {players.length < 4 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                placeholder="Nome do jogador..."
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={addPlayer}
                className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 font-body text-sm hover:brightness-110 transition-all"
              >
                Adicionar
              </button>
            </div>
          )}

          <button
            onClick={() => setShowPhraseManager(true)}
            className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground rounded-lg px-4 py-2 font-body text-sm hover:text-foreground transition-all"
          >
            <Settings size={16} /> Gerenciar Palavras ({phrases.length})
          </button>

          <button
            onClick={startGame}
            className="w-full font-display text-xl py-4 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-lg"
          >
            COMEÇAR!
          </button>
        </div>

        <AnimatePresence>
          {showPhraseManager && (
            <PhraseManager
              phrases={phrases}
              onUpdate={setPhrases}
              onClose={() => setShowPhraseManager(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-4 gap-4 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3 w-full max-w-2xl">
        <button
          onClick={goBackToMenu}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-body text-sm"
        >
          <ArrowLeft size={16} /> Menu
        </button>
        <h1 className="font-display text-2xl sm:text-3xl text-primary glow-gold tracking-wide flex-1 text-center">
          Roda da Fortuna
        </h1>
        <button
          onClick={() => setShowPhraseManager(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Player Scores */}
      <div className="flex flex-wrap justify-center gap-3">
        {players.map((p, i) => (
          <div
            key={i}
            className={`bg-card border-2 rounded-lg px-4 py-2 text-center transition-all ${
              i === currentPlayer && !winner
                ? "border-primary shadow-lg shadow-primary/20 scale-105"
                : "border-border"
            }`}
          >
            <p className="text-muted-foreground text-xs font-body">{p.name}</p>
            <p className="font-display text-lg text-primary">R${p.score.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-foreground font-body text-base text-center max-w-md"
        >
          {message}
        </motion.p>
      </AnimatePresence>

      {/* Letter Board */}
      <LetterBoard phrase={phrase} revealed={revealed} />

      {allRevealed || winner ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <Trophy className="text-primary" size={28} />
            <p className="font-display text-xl text-primary glow-gold">
              {winner ? `${winner.name} VENCEU!` : "RESOLVIDO!"}
            </p>
            <Trophy className="text-primary" size={28} />
          </div>
          <button
            onClick={resetGame}
            className="font-display text-base px-8 py-3 rounded-lg bg-accent text-accent-foreground hover:brightness-110 transition-all"
          >
            NOVO JOGO
          </button>
          <button
            onClick={goBackToMenu}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar ao menu
          </button>
        </motion.div>
      ) : (
        <>
          <Wheel onResult={handleResult} spinning={spinning} setSpinning={setSpinning} />

          {phase === "spin" && !spinning && (
            <button
              onClick={() => setPhase("solve")}
              className="font-display text-sm px-6 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            >
              RESOLVER PUZZLE
            </button>
          )}

          {phase === "guess" && !spinning && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-center text-muted-foreground mb-2 font-body text-sm">Escolha uma letra:</p>
              <LetterPicker usedLetters={usedLetters} onPick={handleLetterPick} disabled={spinning} />
            </motion.div>
          )}

          {phase === "solve" && (
            <SolvePuzzle
              onSolve={handleSolve}
              onCancel={() => {
                setPhase("spin");
                setMessage(`Vez de ${players[currentPlayer].name}! Gire a roleta!`);
              }}
            />
          )}
        </>
      )}

      <AnimatePresence>
        {showPhraseManager && (
          <PhraseManager
            phrases={phrases}
            onUpdate={setPhrases}
            onClose={() => setShowPhraseManager(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
