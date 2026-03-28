'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, UserProfile } from './Rumus';

export interface LembaranState {
    settings: AppSettings;
    profile: UserProfile;
    isVaultLocked: boolean;

    // Actions
    updateSettings: (settings: Partial<AppSettings>) => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    setVaultLocked: (isLocked: boolean) => void;
    addCustomTheme: (name: string, color: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
    language: 'id',
    theme: 'auto',
    accentColor: '#135bec',
    encryptionEnabled: false,
    syncEnabled: false,
    secretMode: "none",
    lastSyncAt: null,
    sessionTimeout: 1,
    vimMode: false,
    biometricEnabled: false,
};

const DEFAULT_PROFILE: UserProfile = {
    name: 'Arsiparis',
    bio: 'Menyusun fragmen memori dalam harmoni.',
    avatarUrl: '',
    level: 1,
    xp: 0,
};

export const usePundi = create<LembaranState>()(
    persist(
        (set) => ({
            settings: DEFAULT_SETTINGS,
            profile: DEFAULT_PROFILE,
            isVaultLocked: true,

            updateSettings: (newSettings) =>
                set((state) => ({ settings: { ...state.settings, ...newSettings } })),

            updateProfile: (newProfile) =>
                set((state) => ({ profile: { ...state.profile, ...newProfile } })),

            setVaultLocked: (isLocked) =>
                set({ isVaultLocked: isLocked }),

            addCustomTheme: (name, color) =>
                set((state) => ({
                    settings: {
                        ...state.settings,
                        customThemes: { ...(state.settings.customThemes || {}), [name]: color }
                    }
                })),
        }),
        {
            name: 'lembaran:pundi',
            partialize: (state) => ({ settings: state.settings, profile: state.profile }),
        }
    )
);
