import { useState } from "react";
import { motion } from "framer-motion";

export interface WheelSegment {
  label: string;
  value: number; // 0 = lose all, -1 = skip turn
  color: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: "R$100", value: 100, color: "hsl(210, 80%, 45%)" },
  { label: "R$250", value: 250, color: "hsl(140, 60%, 40%)" },
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },
  { label: "R$500", value: 500, color: "hsl(280, 60%, 50%)" },
  { label: "R$150", value: 150, color: "hsl(25, 95%, 55%)" },
  { label: "R$300", value: 300, color: "hsl(180, 60%, 40%)" },
  { label: "R$800", value: 800, color: "hsl(350, 70%, 50%)" },
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },
  { label: "R$750", value: 750, color: "hsl(330, 70%, 55%)" },
  { label: "R$200", value: 200, color: "hsl(210, 80%, 55%)" },
  { label: "FALIU", value: 0, color: "hsl(0, 80%, 40%)" },
  { label: "R$400", value: 400, color: "hsl(140, 60%, 35%)" },
  { label: "R$550", value: 550, color: "hsl(25, 85%, 50%)" },
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },
  { label: "R$1000", value: 1000, color: "hsl(45, 100%, 45%)" },
  { label: "R$350", value: 350, color: "hsl(280, 60%, 45%)" },
  { label: "R$200", value: 200, color: "hsl(180, 55%, 45%)" },
  { label: "R$600", value: 600, color: "hsl(160, 60%, 38%)" },
  { label: "R$450", value: 450, color: "hsl(330, 60%, 50%)" },
  { label: "R$900", value: 900, color: "hsl(210, 70%, 40%)" },
  { label: "R$175", value: 175, color: "hsl(45, 80%, 50%)" },
  { label: "R$650", value: 650, color: "hsl(280, 50%, 55%)" },
  { label: "R$1500", value: 1500, color: "hsl(50, 100%, 42%)" },
  { label: "R$275", value: 275, color: "hsl(140, 50%, 45%)" },
];

interface WheelProps {
  onResult: (segment: WheelSegment) => void;
  spinning: boolean;
  setSpinning: (s: boolean) => void;
}

export default function Wheel({ onResult, spinning, setSpinning }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const segAngle = 360 / SEGMENTS.length;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const extraSpins = 8 + Math.random() * 6;
    const landAngle = Math.random() * 360;
    const totalRotation = rotation + extraSpins * 360 + landAngle;
    setRotation(totalRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const index = Math.floor(normalizedAngle / segAngle) % SEGMENTS.length;
      onResult(SEGMENTS[index]);
      setSpinning(false);
    }, 6000);
  };

  const radius = 170;
  const center = 180;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative shadow-wheel rounded-full">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderTop: "28px solid hsl(45, 100%, 50%)",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
            }}
          />
        </div>

        <motion.svg
          width={center * 2}
          height={center * 2}
          animate={{ rotate: rotation }}
          transition={{ duration: 6, ease: [0.12, 0.9, 0.2, 1] }}
          className="rounded-full"
        >
          {SEGMENTS.map((seg, i) => {
            const startAngle = i * segAngle - 90;
            const endAngle = startAngle + segAngle;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);
            const largeArc = segAngle > 180 ? 1 : 0;
            const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
            const textR = radius * 0.62;
            const tx = center + textR * Math.cos(midAngle);
            const ty = center + textR * Math.sin(midAngle);
            const rotAngle = (startAngle + endAngle) / 2;

            // Split label into characters for vertical display
            const chars = seg.label.split("");

            return (
              <g key={i}>
                <path
                  d={`M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={seg.color}
                  stroke="hsl(220, 25%, 8%)"
                  strokeWidth="1.5"
                />
                <g transform={`rotate(${rotAngle + 90}, ${tx}, ${ty})`}>
                  {chars.map((ch, ci) => {
                    const charSpacing = 9;
                    const totalHeight = (chars.length - 1) * charSpacing;
                    const offsetY = ci * charSpacing - totalHeight / 2;
                    return (
                      <text
                        key={ci}
                        x={tx}
                        y={ty + offsetY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="Bungee, cursive"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                      >
                        {ch}
                      </text>
                    );
                  })}
                </g>
              </g>
            );
          })}
          {/* Outer ring */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(45, 100%, 50%)" strokeWidth="3" />
          {/* Center hub */}
          <circle cx={center} cy={center} r="24" fill="hsl(45, 100%, 50%)" stroke="hsl(220, 25%, 8%)" strokeWidth="3" />
          <circle cx={center} cy={center} r="16" fill="hsl(45, 90%, 40%)" />
        </motion.svg>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="font-display text-xl px-10 py-4 rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
      >
        {spinning ? "GIRANDO..." : "GIRAR!"}
      </button>
    </div>
  );
}
