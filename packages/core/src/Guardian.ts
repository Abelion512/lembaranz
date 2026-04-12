'use client';

import { useEffect, useRef } from 'react';
import { useStore } from './Store';
import { Vault } from './Vault';
import { audio, haptic } from './Senses';

/**
 * useGuardian: Hook for monitoring session security.
 * Handles automatic locking based on idle time (sessionTimeout)
 * and tab switching (visibilitychange).
 */
export const useGuardian = () => {
    const isVaultLocked = useStore(s => s.isVaultLocked);
    const setVaultLocked = useStore(s => s.setVaultLocked);
    const settings = useStore(s => s.settings);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const lockVault = () => {
        if (!isVaultLocked) {
            Vault.clearKey();
            setVaultLocked(true);
            audio.lock();
            haptic.medium();
        }
    };

    // 1. Session Timeout (Time-based lock while active)
    useEffect(() => {
        if (!isVaultLocked && settings.sessionTimeout) {
            // Bersihkan timeout lama jika ada
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Set timeout baru sesuai settings (menit -> ms)
            timeoutRef.current = setTimeout(() => {
                lockVault();
            }, settings.sessionTimeout * 60 * 1000);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isVaultLocked, settings.sessionTimeout, setVaultLocked]);

    // 2. Visibility Change (Auto-lock when tab hidden)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && !isVaultLocked) {
                // Beri toleransi 1 menit sebelum mengunci saat tab disembunyikan
                hideTimeoutRef.current = setTimeout(() => {
                    lockVault();
                }, 60000);
            } else if (document.visibilityState === 'visible') {
                // Batalkan penguncian jika user kembali sebelum 1 menit
                if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, [isVaultLocked, setVaultLocked]);
};
