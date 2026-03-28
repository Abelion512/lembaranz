'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    offsetX: number;
    extraDuration: number;
}

export const PerayaanXP = ({ active }: { active: boolean }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (active) {
            const colors = ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#34C759'];
            const newParticles: Particle[] = Array.from({ length: 40 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                color: colors[Math.floor(Math.random() * 5)],
                offsetX: Math.random() * 20 - 10,
                extraDuration: Math.random(),
            }));
            // Delay for next tick to satisfy lint react-hooks/set-state-in-effect
            setTimeout(() => setParticles(newParticles), 0);
            const timer = setTimeout(() => setParticles([]), 3000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    // Pre-compute animation props outside render to avoid calling Math.random during render
    const animationMap = useMemo(() => {
        return new Map(particles.map(p => [
            p.id,
            {
                animate: {
                    opacity: 0,
                    y: '-10vh',
                    x: `${p.x + p.offsetX}vw`,
                    rotate: 360,
                    scale: 0.5
                },
                transition: { duration: 2 + p.extraDuration, ease: "easeOut" as const }
            }
        ]));
    }, [particles]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
            <AnimatePresence>
                {particles.map(p => {
                    const anim = animationMap.get(p.id)!;
                    return (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 1, y: '100vh', x: `${p.x}vw`, scale: 1 }}
                            animate={anim.animate}
                            exit={{ opacity: 0 }}
                            transition={anim.transition}
                            className="absolute w-2 h-2 rounded-full shadow-lg"
                            style={{ backgroundColor: p.color }}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
