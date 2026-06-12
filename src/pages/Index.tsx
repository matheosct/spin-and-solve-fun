import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Trophy, ArrowLeft, Users, Sparkles, Plus, X, Play, Lightbulb } from "lucide-react";
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

function normalize(char: string): string {
  return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10 gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="text-primary" size={28} />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-tight">
            Roda da Fortuna
          </h1>
          <p className="text-muted-foreground text-base">Configure os jogadores e comece a jogar</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-5 shadow-soft">
          <div className="flex items-center gap-2 text-foreground">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="text-primary" size={18} />
            </div>
            <span className="font-medium">Jogadores</span>
            <span className="ml-auto text-xs text-muted-foreground">{players.length}/4</span>
          </div>

          <div className="space-y-2">
            {players.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary rounded-2xl px-4 py-3">
                <span className="text-foreground">{p.name}</span>
                {players.length > 2 && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={16} />
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
                className="flex-1 bg-secondary border border-transparent rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-ring focus:bg-card transition-colors"
              />
              <button
                onClick={addPlayer}
                className="bg-primary/10 text-primary rounded-2xl px-4 hover:bg-primary/15 transition-all flex items-center justify-center"
                aria-label="Adicionar"
              >
                <Plus size={18} />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowPhraseManager(true)}
            className="w-full flex items-center gap-3 bg-secondary text-foreground rounded-2xl px-4 py-3 text-sm hover:bg-muted transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Settings className="text-accent" size={16} />
            </div>
            <span className="flex-1 text-left">Gerenciar Palavras</span>
            <span className="text-muted-foreground text-xs">{phrases.length}</span>
          </button>

          <button
            onClick={startGame}
            className="w-full font-display text-lg py-4 rounded-2xl bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-soft hover:shadow-hover flex items-center justify-center gap-2"
          >
            <Play size={20} /> Começar
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
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-5 gap-5 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3 w-full max-w-3xl">
        <button
          onClick={goBackToMenu}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm bg-card border border-border rounded-2xl px-3 py-2 shadow-soft"
        >
          <ArrowLeft size={16} /> Menu
        </button>
        <h1 className="font-display text-2xl sm:text-3xl text-foreground tracking-tight flex-1 text-center">
          Roda da Fortuna
        </h1>
        <button
          onClick={() => setShowPhraseManager(true)}
          className="w-10 h-10 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center shadow-soft"
          aria-label="Configurações"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Player Scores */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl">
        {players.map((p, i) => {
          const active = i === currentPlayer && !winner;
          return (
            <div
              key={i}
              className={`flex-1 min-w-[140px] rounded-2xl px-4 py-3 transition-all border ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-hover scale-[1.02]"
                  : "bg-card text-foreground border-border shadow-soft"
              }`}
            >
              <p className={`text-xs ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {p.name}
              </p>
              <p className="font-display text-xl tracking-tight">R${p.score.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="bg-card border border-border rounded-2xl px-5 py-3 shadow-soft max-w-xl flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Lightbulb className="text-accent" size={16} />
          </div>
          <p className="text-foreground text-sm">{message}</p>
        </motion.div>
      </AnimatePresence>

      {/* Letter Board */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-soft w-full max-w-3xl">
        <LetterBoard phrase={phrase} revealed={revealed} />
      </div>

      {allRevealed || winner ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 bg-card border border-border rounded-2xl p-6 shadow-soft"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Trophy className="text-accent" size={28} />
          </div>
          <p className="font-display text-2xl text-foreground tracking-tight">
            {winner ? `${winner.name} venceu!` : "Resolvido!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={resetGame}
              className="font-display text-base px-6 py-3 rounded-2xl bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-soft hover:shadow-hover"
            >
              Novo jogo
            </button>
            <button
              onClick={goBackToMenu}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3 rounded-2xl bg-secondary"
            >
              Voltar ao menu
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <Wheel onResult={handleResult} spinning={spinning} setSpinning={setSpinning} />

          {phase === "spin" && !spinning && (
            <button
              onClick={() => setPhase("solve")}
              className="font-medium text-sm px-5 py-3 rounded-2xl bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2"
            >
              <Lightbulb size={16} /> Resolver puzzle
            </button>
          )}

          {phase === "guess" && !spinning && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-soft w-full max-w-xl"
            >
              <p className="text-center text-muted-foreground mb-3 text-sm">Escolha uma letra</p>
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
