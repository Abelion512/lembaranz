import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';

interface MonitorScreenProps {
    context: string;
    onBack: () => void;
}

export const MonitorScreen: React.FC<MonitorScreenProps> = ({ context, onBack }) => {
    const [loading, setMemuat] = useState(true);
    const [stats, setStats] = useState<{ notes: number; folders: number } | null>(null);
    const [isInit, setIsInit] = useState(false);
    const [vaultLocked, setVaultLocked] = useState(true);
    const [envKeys, setEnvKeys] = useState<string[]>([]);

    useInput((input, key) => {
        if (input === 'q' || key.escape) {
            onBack();
        }
    });

    useEffect(() => {
        const load = async () => {
            try {
                // Lazy import to avoid Bun crash with node:fs modules during Ink render
                const { Archive, Context } = await import('@lembaranzz/core');
                const { Vault } = await import('@lembaranzz/core');

                const initRes = await Archive.isVaultInitialized();
                setIsInit(!initRes.error && !!initRes.data);
                setVaultLocked(Vault.isLocked());

                const s = await Archive.getStats();
                setStats(s);

                const env = await Context.readEnv();
                setEnvKeys(Object.keys(env));
            } catch {
                // Ignore errors
            } finally {
                setMemuat(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <Box padding={1}>
                <Text color="cyan"><Spinner type="dots" /></Text>
                <Text color="gray"> Loading system status...</Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
                <Text color="blue" bold>📊 System Status [{context.toUpperCase()}]</Text>
            </Box>

            <Box flexDirection="column" paddingX={1} gap={0} key="status-container">
                {/* Vault Status */}
                <Box key="brankas-status" borderStyle="round" borderColor={isInit ? 'green' : 'yellow'} paddingX={1} flexDirection="column" marginBottom={1}>
                    <Text bold>🔐 Vault</Text>
                    <Text color={isInit ? 'green' : 'yellow'}>
                        {isInit ? '✅ Initialized' : '⚠️ Not Setup Yet'}
                    </Text>
                    <Text color={vaultLocked ? 'yellow' : 'green'}>
                        {vaultLocked ? '🔒 Locked' : '🔓 Unlocked'}
                    </Text>
                </Box>

                {/* Security */}
                <Box key="security-status" borderStyle="round" borderColor="green" paddingX={1} flexDirection="column" marginBottom={1}>
                    <Text bold>🛡️ Security</Text>
                    <Text color="green">✅ AES-GCM 256-bit</Text>
                    <Text color="green">✅ Argon2id (OWASP)</Text>
                    <Text color="green">✅ SHA-256 Integrity</Text>
                    <Text color="green">✅ Secret Scrubber</Text>
                </Box>

                {/* Stats */}
                {stats && (
                    <Box key="stats-section" borderStyle="round" borderColor="cyan" paddingX={1} flexDirection="column" marginBottom={1}>
                        <Text bold>📂 Statistics</Text>
                        <Text color="cyan">Notes: <Text bold key="stats-notes">{stats.notes}</Text></Text>
                        <Text color="magenta">Folders: <Text bold key="stats-folders">{stats.folders}</Text></Text>
                    </Box>
                )}

                {/* Environment */}
                {envKeys.length > 0 && (
                    <Box key="env-section" borderStyle="round" borderColor="gray" paddingX={1} flexDirection="column">
                        <Text bold>🌱 Environment (.env)</Text>
                        <Text color="gray">{envKeys.length} variables detected</Text>
                        {envKeys.slice(0, 5).map((k, idx) => (
                            <Text key={`env-${k}-${idx}`} color="gray"> ├ {k}</Text>
                        ))}
                        {envKeys.length > 5 && <Text key="env-more" color="gray"> └ ...and {envKeys.length - 5} more</Text>}
                    </Box>
                )}
            </Box>

            <Box marginTop={1} paddingX={1}>
                <Text color="gray" dimColor italic>Press [q] or [Esc] to go back</Text>
            </Box>
        </Box>
    );
};
