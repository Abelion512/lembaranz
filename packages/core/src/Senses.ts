/**
 * Senses: Haptic feedback support for web.
 * Kept for API compatibility and providing physical feedback.
 */
export const haptic = {
    vibrate(pattern: number | number[]): void {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(pattern);
        }
    },
    light: () => haptic.vibrate(10),
    medium: () => haptic.vibrate(20),
    heavy: () => haptic.vibrate(50),
    success: () => haptic.vibrate([10, 30, 10]),
    warning: () => haptic.vibrate([100, 30, 100]),
    error: () => haptic.vibrate([100, 30, 100, 30, 100]),
};
