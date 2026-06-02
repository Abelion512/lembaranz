export type EntityId = string;

/** Note as stored in storage (all sensitive fields encrypted as strings) */
export interface StoredNote {
    id: EntityId;
    title: string; // Encrypted: iv|base64
    content: string; // Encrypted: iv|base64
    preview?: string; // Encrypted: iv|base64
    folderId: EntityId | null;
    isPinned: boolean;
    isFavorite: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isCredentials?: boolean;
    /** Encrypted credentials blob */
    credentials?: string;
    _hash?: string;
    _timestamp?: string;
    syncStatus?: "synced" | "pending" | "error";
}

/** Credentials object (only available after decryption) */
export interface CredentialsData {
    username?: string;
    password?: string;
    url?: string;
}

/** Note after decryption (credentials are parsed) */
export interface DecryptedNote extends Omit<StoredNote, 'credentials'> {
    /** Decrypted credentials object or undefined */
    credentials?: CredentialsData | string;
    /** Plaintext title after decryption */
    title: string;
    /** Plaintext content after decryption */
    content: string;
}

/** Unified Note type for backward compatibility - use StoredNote or DecryptedNote for clarity */
export type Note = StoredNote | DecryptedNote;

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
    agentAccessControl?: {
        enabled: boolean;
        allowedAgents: string[];
    };
}

export interface UserProfile {
    name: string;
    bio: string;
    avatarUrl: string;
    level: number;
    xp: number;
}
