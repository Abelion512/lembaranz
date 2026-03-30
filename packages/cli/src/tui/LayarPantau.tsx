import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';

interface LayarPantauProps {
    konteks: string;
    onKembali: () => void;
}

export const LayarPantau: React.FC<LayarPantauProps> = ({ konteks, onKembali }) => {
    const [memuat, setMemuat] = useState(true);
    const [stats, setStats] = useState<{ notes: number; folders: number } | null>(null);
    const [isInit, setIsInit] = useState(false);
    const [brankasLocked, setBrankasLocked] = useState(true);
    const [envKeys, setEnvKeys] = useState<string[]>([]);

    useInput((input, key) => {
        if (input === 'q' || key.escape) {
            onKembali();
        }
    });

    useEffect(() => {
        const muat = async () => {
            try {
                // Lazy import to avoid Bun crash with node:fs modules during Ink render
                const { Arsip, Laras } = await import('@lembaranz/core');
                const { Brankas } = await import('@lembaranz/core');

                const init = await Arsip.isVaultInitialized();
                setIsInit(init);
                setBrankasLocked(Brankas.isLocked());

                const s = await Arsip.getStats();
                setStats(s);

                const env = Laras.bacaEnv();
                setEnvKeys(Object.keys(env));
            } catch {
                // Ignore errors
            } finally {
                setMemuat(false);
            }
        };
        muat();
    }, []);

    if (memuat) {
        return (
            <Box padding={1}>
                <Text color="cyan"><Spinner type="dots" /></Text>
                <Text color="gray"> Memuat status sistem...</Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>📊 Status Sistem [{konteks.toUpperCase()}]</Text>
            </Box>

            <Box flexDirection="column" paddingX={1} gap={0} key="status-container">
                {/* Brankas Status */}
                <Box key="brankas-status" borderStyle="round" borderColor={isInit ? 'green' : 'yellow'} paddingX={1} flexDirection="column" marginBottom={1}>
                    <Text bold>🔐 Brankas</Text>
                    <Text color={isInit ? 'green' : 'yellow'}>
                        {isInit ? '✅ Terinisialisasi' : '⚠️ Belum Disiapkan'}
                    </Text>
                    <Text color={brankasLocked ? 'yellow' : 'green'}>
                        {brankasLocked ? '🔒 Terkunci' : '🔓 Terbuka'}
                    </Text>
                </Box>

                {/* Security */}
                <Box key="security-status" borderStyle="round" borderColor="green" paddingX={1} flexDirection="column" marginBottom={1}>
                    <Text bold>🛡️ Keamanan</Text>
                    <Text color="green">✅ AES-GCM 256-bit</Text>
                    <Text color="green">✅ Argon2id (OWASP)</Text>
                    <Text color="green">✅ SHA-256 Integrity</Text>
                    <Text color="green">✅ Secret Scrubber</Text>
                </Box>

                {/* Stats */}
                {stats && (
                    <Box key="stats-section" borderStyle="round" borderColor="cyan" paddingX={1} flexDirection="column" marginBottom={1}>
                        <Text bold>📂 Statistik</Text>
                        <Text color="cyan">Catatan: <Text bold key="stats-notes">{stats.notes}</Text></Text>
                        <Text color="magenta">Folder: <Text bold key="stats-folders">{stats.folders}</Text></Text>
                    </Box>
                )}

                {/* Environment */}
                {envKeys.length > 0 && (
                    <Box key="env-section" borderStyle="round" borderColor="gray" paddingX={1} flexDirection="column">
                        <Text bold>🌱 Pelataran (.env)</Text>
                        <Text color="gray">{envKeys.length} variabel terdeteksi</Text>
                        {envKeys.slice(0, 5).map((k, idx) => (
                            <Text key={`env-${k}-${idx}`} color="gray"> ├ {k}</Text>
                        ))}
                        {envKeys.length > 5 && <Text key="env-more" color="gray"> └ ...dan {envKeys.length - 5} lainnya</Text>}
                    </Box>
                )}
            </Box>

            <Box marginTop={1} paddingX={1}>
                <Text color="gray" dimColor italic>Tekan [q] atau [Esc] untuk kembali</Text>
            </Box>
        </Box>
    );
};
