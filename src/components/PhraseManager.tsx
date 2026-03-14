import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Settings, Upload } from "lucide-react";

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

    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[70vh] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-primary">Gerenciar Palavras</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPhrase()}
            placeholder="Nova palavra ou frase..."
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={addPhrase}
            className="bg-accent text-accent-foreground rounded-lg px-3 py-2 hover:brightness-110 transition-all"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* File upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground rounded-lg px-4 py-2 font-body text-sm hover:text-foreground transition-all border border-dashed border-border"
        >
          <Upload size={16} /> Importar lista de palavras (.txt)
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {phrases.map((phrase, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 group"
            >
              <span className="font-body text-sm text-foreground">{phrase}</span>
              <button
                onClick={() => removePhrase(i)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                disabled={phrases.length <= 1}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-xs font-body text-center">
          {phrases.length} palavra(s) na lista
        </p>
      </motion.div>
    </motion.div>
  );
}
