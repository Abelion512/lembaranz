'use client';

import { useEffect, useRef } from 'react';
import { usePundi } from './Pundi';
import { Brankas } from './Brankas';
import { audio, haptic } from './Indera';

/**
 * usePenjaga: Hook untuk memantau keamanan sesi.
 * Menangani penguncian otomatis berdasarkan waktu idle (sessionTimeout)
 * dan perpindahan tab (visibilitychange).
 */
export const usePenjaga = () => {
    const isVaultLocked = usePundi(s => s.isVaultLocked);
    const setVaultLocked = usePundi(s => s.setVaultLocked);
    const settings = usePundi(s => s.settings);
    
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const gembokBrankas = () => {
        if (!isVaultLocked) {
            Brankas.clearKey();
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
            
            // Set timeout baru sesuai pengaturan (menit -> ms)
            timeoutRef.current = setTimeout(() => {
                gembokBrankas();
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
                    gembokBrankas();
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
