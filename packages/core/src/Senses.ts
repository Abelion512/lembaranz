export const haptic = {
    light: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    },
    medium: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(25);
        }
    },
    heavy: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }
    },
    error: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([30, 50, 30, 50]);
        }
    },
    success: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([10, 30, 10]);
        }
    }
};

export const audio = {
    play: (frequency: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
        if (typeof window === 'undefined') return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (_e) {
            // Silently fail as haptics/audio are non-critical enhancements
        }
    },
    click: () => audio.play(440, 'sine', 0.05),
    unlock: () => {
        audio.play(523.25, 'sine', 0.1); // C5
        setTimeout(() => audio.play(659.25, 'sine', 0.2), 100); // E5
    },
    lock: () => {
        audio.play(329.63, 'sine', 0.1); // E4
        setTimeout(() => audio.play(261.63, 'sine', 0.2), 100); // C4
    }
};
