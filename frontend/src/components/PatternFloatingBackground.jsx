// src/components/PatternFloatingBackground.jsx
import { motion } from "framer-motion";

const SHAPES = [
  { type: "circle", size: 26, color: "rgba(156,163,175,0.55)" },  
  { type: "square", size: 30, color: "rgba(129,140,248,0.75)" }, 
  { type: "triangle", size: 32, color: "rgba(129,140,248,0.75)" },
  { type: "bubble", size: 45, color: "rgba(251,191,36,0.95)" },  
  { type: "wave", size: 70, color: "rgba(251,191,36,0.95)" },
  { type: "dots", size: 36, color: "rgba(129,140,248,0.75)" },
];

const rand = (min, max) => Math.random() * (max - min) + min;

export default function PatternFloatingBackground({ count = 30 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => {
        const s = SHAPES[i % SHAPES.length];

        return (
          <motion.div
            key={i}
            initial={{
              opacity: rand(0.25, 0.5),
              y: rand(-30, 30),
              x: rand(-30, 30),
            }}
            animate={{
              opacity: [rand(0.3, 0.6), rand(0.5, 0.8), rand(0.3, 0.6)],
              y: [rand(-20, 20), rand(-50, 50), rand(-20, 20)],
              x: [rand(-20, 20), rand(-50, 50), rand(-20, 20)],
              rotate: [rand(-20, 20), rand(-45, 45), rand(-20, 20)],
            }}
            transition={{
              duration: rand(14, 22),   // faster movement
              repeat: Infinity,
              ease: "easeInOut",
              delay: rand(0, 4),
            }}
            style={{
              position: "absolute",
              top: `${rand(3, 93)}%`,
              left: `${rand(3, 93)}%`,
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {renderShape(s)}
          </motion.div>
        );
      })}
    </>
  );
}

function renderShape({ type, size, color }) {
  switch (type) {
    case "circle":
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
          }}
        />
      );

    case "square":
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: 8,
            background: color,
          }}
        />
      );

    case "triangle":
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
          }}
        />
      );

    case "bubble":
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -size * 0.28,
              left: size * 0.28,
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: "50%",
              background: color,
              clipPath: "polygon(0 0, 100% 0, 0 100%)",
            }}
          />
        </div>
      );

    case "wave":
      return (
        <svg width={size} height={size / 3}>
          <path
            d={`M0 ${size / 6} Q ${size / 4} 0, ${size / 2} ${size / 6} T ${size} ${size / 6}`}
            stroke={color}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "dots":
      return (
        <svg width={size} height={size}>
          {Array.from({ length: 9 }).map((_, i) => (
            <circle
              key={i}
              cx={(i % 3) * (size / 3) + size / 6}
              cy={Math.floor(i / 3) * (size / 3) + size / 6}
              r={size * 0.1}
              fill={color}
            />
          ))}
        </svg>
      );

    default:
      return null;
  }
}
