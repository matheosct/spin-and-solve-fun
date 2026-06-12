import { useState } from "react";
import { motion } from "framer-motion";

export interface WheelSegment {
  label: string;
  value: number; // 0 = lose all, -1 = skip turn
  color: string;
}

// 24 segments — PASSA at indices 0, 6, 12, 18 (cross pattern) and FALIU at indices 3, 15 (opposite sides)
const SEGMENTS: WheelSegment[] = [
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },       // 0
  { label: "R$250", value: 250, color: "hsl(140, 60%, 40%)" },      // 1
  { label: "R$500", value: 500, color: "hsl(280, 60%, 50%)" },      // 2
  { label: "FALIU", value: 0, color: "hsl(0, 80%, 40%)" },          // 3
  { label: "R$150", value: 150, color: "hsl(25, 95%, 55%)" },       // 4
  { label: "R$800", value: 800, color: "hsl(350, 70%, 50%)" },      // 5
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },       // 6
  { label: "R$300", value: 300, color: "hsl(180, 60%, 40%)" },      // 7
  { label: "R$750", value: 750, color: "hsl(330, 70%, 55%)" },      // 8
  { label: "R$200", value: 200, color: "hsl(210, 80%, 55%)" },      // 9
  { label: "R$1000", value: 1000, color: "hsl(45, 100%, 45%)" },    // 10
  { label: "R$400", value: 400, color: "hsl(140, 60%, 35%)" },      // 11
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },       // 12
  { label: "R$550", value: 550, color: "hsl(25, 85%, 50%)" },       // 13
  { label: "R$350", value: 350, color: "hsl(280, 60%, 45%)" },      // 14
  { label: "FALIU", value: 0, color: "hsl(0, 80%, 40%)" },          // 15
  { label: "R$600", value: 600, color: "hsl(160, 60%, 38%)" },      // 16
  { label: "R$175", value: 175, color: "hsl(45, 80%, 50%)" },       // 17
  { label: "PASSA", value: -1, color: "hsl(220, 20%, 30%)" },       // 18
  { label: "R$900", value: 900, color: "hsl(210, 70%, 40%)" },      // 19
  { label: "R$450", value: 450, color: "hsl(330, 60%, 50%)" },      // 20
  { label: "R$100", value: 100, color: "hsl(210, 80%, 45%)" },      // 21
  { label: "R$650", value: 650, color: "hsl(280, 50%, 55%)" },      // 22
  { label: "R$1500", value: 1500, color: "hsl(50, 100%, 42%)" },    // 23
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

  const radius = 240;
  const center = 250;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative shadow-wheel rounded-full">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "16px solid transparent",
              borderRight: "16px solid transparent",
              borderTop: "32px solid hsl(45, 100%, 50%)",
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
                    const charSpacing = 12;
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
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="Geist, system-ui, sans-serif"
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
          <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(45, 100%, 50%)" strokeWidth="3" />
          <circle cx={center} cy={center} r="28" fill="hsl(45, 100%, 50%)" stroke="hsl(220, 25%, 8%)" strokeWidth="3" />
          <circle cx={center} cy={center} r="18" fill="hsl(45, 90%, 40%)" />
        </motion.svg>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 font-display text-sm px-5 py-2.5 rounded-2xl text-primary-foreground hover:brightness-110 disabled:opacity-60 transition-all shadow-soft hover:shadow-hover active:scale-95 whitespace-nowrap mt-20"
      >
        {spinning ? "..." : "GIRAR"}
      </button>
    </div>
  );
}
