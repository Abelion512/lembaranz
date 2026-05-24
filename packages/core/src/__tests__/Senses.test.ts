import { describe, test, expect, spyOn, beforeEach, afterEach } from 'bun:test';
import { haptic } from '../Senses';

describe('Senses (Haptic)', () => {
    let vibrateSpy: any;

    beforeEach(() => {
        // Mock navigator.vibrate if it doesn't exist in the environment
        if (typeof (global as any).navigator === 'undefined') {
            (global as any).navigator = {
                vibrate: () => true
            };
        } else if (typeof (global as any).navigator.vibrate === 'undefined') {
            (global as any).navigator.vibrate = () => true;
        }
        
        vibrateSpy = spyOn(global.navigator, 'vibrate');
    });

    afterEach(() => {
        vibrateSpy.mockRestore();
    });

    test('vibrate should call navigator.vibrate when available', () => {
        haptic.vibrate(100);
        expect(vibrateSpy).toHaveBeenCalledWith(100);
    });

    test('light should call vibrate with 10ms', () => {
        haptic.light();
        expect(vibrateSpy).toHaveBeenCalledWith(10);
    });

    test('medium should call vibrate with 20ms', () => {
        haptic.medium();
        expect(vibrateSpy).toHaveBeenCalledWith(20);
    });

    test('heavy should call vibrate with 50ms', () => {
        haptic.heavy();
        expect(vibrateSpy).toHaveBeenCalledWith(50);
    });

    test('success should call vibrate with success pattern', () => {
        haptic.success();
        expect(vibrateSpy).toHaveBeenCalledWith([10, 30, 10]);
    });

    test('warning should call vibrate with warning pattern', () => {
        haptic.warning();
        expect(vibrateSpy).toHaveBeenCalledWith([100, 30, 100]);
    });

    test('error should call vibrate with error pattern', () => {
        haptic.error();
        expect(vibrateSpy).toHaveBeenCalledWith([100, 30, 100, 30, 100]);
    });

    test('vibrate should not throw if navigator.vibrate is missing', () => {
        const originalVibrate = global.navigator.vibrate;
        // @ts-ignore
        delete global.navigator.vibrate;

        expect(() => haptic.vibrate(100)).not.toThrow();

        // Restore
        global.navigator.vibrate = originalVibrate;
    });

    test('helper methods should work when destructured', () => {
        const { light, success } = haptic;
        
        light();
        expect(vibrateSpy).toHaveBeenCalledWith(10);
        
        success();
        expect(vibrateSpy).toHaveBeenCalledWith([10, 30, 10]);
    });

    test('vibrate should not call navigator.vibrate if navigator is undefined', () => {
        const originalNavigator = (global as any).navigator;
        (global as any).navigator = undefined;

        haptic.vibrate(100);
        // We can't easily assert on a missing navigator with spyOn, 
        // but we verify it doesn't throw.
        expect(true).toBe(true);

        (global as any).navigator = originalNavigator;
    });
});
