'use client';

import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { usePundi } from '@lembaran/core/Pundi';
import { haptic } from '@lembaran/core/Indera';

export const SaklarSuasana = () => {
    const { settings, updateSettings } = usePundi();

    const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
        const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(settings.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];

        haptic.light();

        // Check if browser supports View Transition API
        if (!document.startViewTransition) {
            updateSettings({ theme: nextTheme });
            return;
        }

        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            updateSettings({ theme: nextTheme });
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0 at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 500,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    pseudoElement: '::view-transition-new(root)',
                }
            );
        });
    };

    const Icon = settings.theme === 'light' ? Sun : settings.theme === 'dark' ? Moon : Laptop;

    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
            title={`Mode: ${settings.theme}`}
        >
            <Icon size={20} />
        </button>
    );
};
