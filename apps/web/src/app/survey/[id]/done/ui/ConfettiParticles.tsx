"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ["bg-violet-500", "bg-yellow-500", "bg-mint-500", "bg-violet-50"];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
}

export function ConfettiParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const newParticles: Particle[] = Array.from({ length: 100 }, (_, i) => {
      const startX = (Math.random() - 0.5) * 800;
      const startY = -200 - Math.random() * screenHeight * 1.4;
      const endX = startX + (Math.random() - 0.5) * 150;
      const fallDistance = screenHeight + 400;

      return {
        id: i,
        x: endX,
        y: startY + fallDistance,
        rotation: Math.random() * 720,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "bg-violet-500",
        size: 6 + Math.random() * 10,
        duration: 2 + Math.random() * 2,
        delay: 0,
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-start justify-center z-50">
      <div className="relative w-full h-full">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className={`absolute ${particle.color} rounded-[2px]`}
            style={{
              width: particle.size,
              height: particle.size,
              left: "50%",
              top: 0,
            }}
            initial={{
              x: particle.x * 0.7,
              y: -100,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              x: [
                particle.x * 0.7,
                particle.x * 0.7 + 30,
                particle.x * 0.7 - 20,
                particle.x + 25,
                particle.x - 15,
                particle.x,
              ],
              y: particle.y,
              opacity: [0, 1, 1, 0.8, 0],
              rotate: particle.rotation,
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "linear",
              x: {
                duration: particle.duration,
                ease: "easeInOut",
              },
              y: {
                duration: particle.duration,
                ease: "linear",
              },
            }}
          />
        ))}
      </div>
    </div>
  );
}
