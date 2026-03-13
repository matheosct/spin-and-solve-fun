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
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },
  { label: "R$750", value: 750, color: "hsl(330, 70%, 55%)" },
  { label: "R$200", value: 200, color: "hsl(210, 80%, 45%)" },
  { label: "FALIU", value: 0, color: "hsl(0, 80%, 45%)" },
  { label: "R$400", value: 400, color: "hsl(140, 60%, 40%)" },
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },
  { label: "R$1000", value: 1000, color: "hsl(45, 100%, 50%)" },
  { label: "R$350", value: 350, color: "hsl(280, 60%, 50%)" },
  { label: "R$200", value: 200, color: "hsl(25, 95%, 55%)" },
  { label: "R$600", value: 600, color: "hsl(180, 60%, 40%)" },
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
    const extraSpins = 5 + Math.random() * 5;
    const landAngle = Math.random() * 360;
    const totalRotation = rotation + extraSpins * 360 + landAngle;
    setRotation(totalRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const index = Math.floor(normalizedAngle / segAngle) % SEGMENTS.length;
      onResult(SEGMENTS[index]);
      setSpinning(false);
    }, 4000);
  };

  const radius = 150;
  const center = 160;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative shadow-wheel rounded-full">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "24px solid hsl(45, 100%, 50%)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}
          />
        </div>

        <motion.svg
          width={center * 2}
          height={center * 2}
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.15, 0.85, 0.25, 1] }}
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
            const textR = radius * 0.7;
            const tx = center + textR * Math.cos(midAngle);
            const ty = center + textR * Math.sin(midAngle);

            return (
              <g key={i}>
                <path
                  d={`M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={seg.color}
                  stroke="hsl(220, 25%, 8%)"
                  strokeWidth="2"
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={seg.label.length > 5 ? "7" : seg.label.length > 4 ? "8" : "11"}
                  fontWeight="bold"
                  fontFamily="Bungee, cursive"
                  transform={`rotate(${(startAngle + endAngle) / 2 + 90}, ${tx}, ${ty})`}
                >
                  {seg.label}
                </text>
              </g>
            );
          })}
          <circle cx={center} cy={center} r="20" fill="hsl(45, 100%, 50%)" stroke="hsl(220, 25%, 8%)" strokeWidth="3" />
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
