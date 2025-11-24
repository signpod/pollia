"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ["bg-violet-500", "bg-yellow-500", "bg-mint-500", "bg-violet-50"];

interface Particle {
  id: number;
  angle: number;
  distance: number;
  rotation: number;
  color: string;
  width: number;
  height: number;
  duration: number;
  delay: number;
}

export function ConfettiParticlesBurst() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = 50;
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
      const baseAngle = (i / particleCount) * Math.PI * 2;
      const angleVariation = (Math.random() - 0.5) * 0.2;
      const angle = baseAngle + angleVariation;

      const baseDistance = 350;
      const distanceVariation = (Math.random() - 0.5) * 60;
      const distance = baseDistance + distanceVariation;

      return {
        id: i,
        angle,
        distance,
        rotation: Math.random() * 720 - 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "bg-violet-500",
        width: 6 + Math.random() * 4,
        height: 10 + Math.random() * 8,
        duration: 1 + Math.random() * 0.5,
        delay: Math.random() * 0.2,
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute pointer-events-none flex items-center justify-center z-10">
      <div className="relative">
        {particles.map(particle => {
          const endX = Math.cos(particle.angle) * particle.distance;
          const endY = Math.sin(particle.angle) * particle.distance;

          return (
            <motion.div
              key={particle.id}
              className={`absolute ${particle.color} rounded-[2px]`}
              style={{
                width: particle.width,
                height: particle.height,
                left: 0,
                top: 0,
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                rotate: 0,
                scale: 0,
              }}
              animate={{
                x: endX,
                y: endY,
                opacity: [0, 1, 1, 0.6, 0],
                rotate: particle.rotation,
                scale: [0, 1.2, 1, 1, 0.8],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeOut",
                opacity: {
                  duration: particle.duration,
                  ease: "easeInOut",
                },
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
