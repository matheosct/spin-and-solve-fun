import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Plus, Upload, BookOpen, Trash2 } from "lucide-react";

interface PhraseManagerProps {
  phrases: string[];
  onUpdate: (phrases: string[]) => void;
  onClose: () => void;
}

export default function PhraseManager({ phrases, onUpdate, onClose }: PhraseManagerProps) {
  const [newPhrase, setNewPhrase] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPhrase = () => {
    const trimmed = newPhrase.trim().toUpperCase();
    if (trimmed && !phrases.includes(trimmed)) {
      onUpdate([...phrases, trimmed]);
      setNewPhrase("");
    }
  };

  const removePhrase = (index: number) => {
    if (phrases.length <= 1) return;
    onUpdate(phrases.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim().toUpperCase())
        .filter((l) => l.length > 0);
      if (lines.length > 0) {
        const unique = [...new Set([...phrases, ...lines])];
        onUpdate(unique);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col gap-4 shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="text-primary" size={18} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg text-foreground tracking-tight">Gerenciar palavras</h2>
            <p className="text-muted-foreground text-xs">{phrases.length} palavra(s) na lista</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPhrase()}
            placeholder="Nova palavra ou frase..."
            className="flex-1 bg-secondary border border-transparent rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-ring focus:bg-card transition-colors"
          />
          <button
            onClick={addPhrase}
            className="bg-primary text-primary-foreground rounded-2xl px-4 hover:brightness-110 transition-all shadow-soft flex items-center justify-center"
          >
            <Plus size={18} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 bg-secondary text-foreground rounded-2xl px-4 py-3 text-sm hover:bg-muted transition-all border border-dashed border-border"
        >
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
            <Upload className="text-accent" size={16} />
          </div>
          <span>Importar lista de palavras (.txt)</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1">
          {phrases.map((phrase, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-secondary rounded-2xl px-4 py-2.5 group"
            >
              <span className="text-sm text-foreground truncate">{phrase}</span>
              <button
                onClick={() => removePhrase(i)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                disabled={phrases.length <= 1}
                aria-label="Remover"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
