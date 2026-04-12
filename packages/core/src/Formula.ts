export type EntityId = string;

export interface Note {
    id: EntityId;
    title: string;
    content: string; // Encrypted blob (iv|data)
    preview?: string; // Plain-text snippet for list view
    folderId: EntityId | null;
    isPinned: boolean;
    isFavorite: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isCredentials?: boolean;
    kredensial?: string | {
        username?: string;
        password?: string;
        url?: string;
    };
    _hash?: string;
    _timestamp?: string;
    syncStatus?: "synced" | "pending" | "error";
}

export interface Folder {
    id: EntityId;
    name: string;
    parentId: EntityId | null;
    icon?: string;
    color?: string;
    createdAt: string;
}

export interface AppSettings {
    language: 'id' | 'en';
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    encryptionEnabled: boolean;
    syncEnabled: boolean;
    lastSyncAt: string | null;
    secretMode: "none" | "gmail";
    panicKeyHash?: string;
    sessionTimeout?: number;
    customThemes?: Record<string, string>;
    vimMode?: boolean;
    biometricEnabled?: boolean;
}

export interface UserProfile {
    name: string;
    bio: string;
    avatarUrl: string;
    level: number;
    xp: number;
}
