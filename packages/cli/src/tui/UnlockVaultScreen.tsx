import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { UI_TOKENS } from "./theme.js";
import Spinner from 'ink-spinner';

interface UnlockVaultScreenProps {
    onSuccess: () => void;
}

export const UnlockVaultScreen: React.FC<UnlockVaultScreenProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInit, setIsInit] = useState<boolean | null>(null);
    const [mode, setMode] = useState<'unlock' | 'setup' | 'mnemonic'>('unlock');
    const [mnemonic, setMnemonic] = useState('');
    const [checksumWarning, setChecksumWarning] = useState<string | null>(null);

    useEffect(() => {
        const check = async () => {
            const { Archive } = await import('@lembaranz/core');
            const result = await Archive.isVaultInitialized();
            if (result.error) {
                setError('Failed to check vault status.');
                setIsInit(false);
            } else {
                setIsInit(result.data);
                if (!result.data) setMode('setup');
            }
        };
        check();
    }, []);

    const handlePasswordSubmit = async () => {
        if (password.length < 8) {
            setError('Minimum 8 characters required.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { Archive } = await import('@lembaranz/core');
            if (mode === 'setup') {
                const result = await Archive.setupVault(password);
                if (result.error) {
                    setError(result.error.message || 'Failed to setup vault.');
                } else {
                    onSuccess();
                }
            } else {
                const result = await Archive.unlockVault(password);
                if (!result.error && result.data) {
                    onSuccess();
                } else {
                    setError(result.error?.message || 'Wrong password.');
                }
            }
        } catch (_e) {
            setError('Failed to process vault.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMnemonicSubmit = async () => {
        setIsLoading(true);
        setError(null);
        setChecksumWarning(null);
        try {
            const { Archive, validateMnemonicChecksum } = await import('@lembaranz/core');

            // Advisory only. A failed checksum usually means one mistyped word, but
            // it can also mean a phrase written down by an older release, so
            // recovery is still attempted and the warning never blocks it.
            if (!validateMnemonicChecksum(mnemonic)) {
                setChecksumWarning('This phrase fails its BIP39 checksum. One word is probably mistyped, or the phrase came from an older release. Trying anyway.');
            }

            const result = await Archive.recoverVault(mnemonic);
            if (!result.error && result.data) {
                // Force user to set new password after recovery
                setMode('setup');
                setPassword('');
            } else {
                setError(result.error?.message || 'Invalid paper key.');
            }
        } catch (_e) {
            setError('Failed to recover vault.');
        } finally {
            setIsLoading(false);
        }
    };

    useInput((input, key) => {
        if (key.escape) {
            // Optional: exit or something
        }
        if (input === 'r' && mode === 'unlock') {
            setMode('mnemonic');
            setError(null);
            setChecksumWarning(null);
        } else if (input === 'l' && mode === 'mnemonic') {
            setMode('unlock');
            setError(null);
            setChecksumWarning(null);
        }
    });

    if (isInit === null) return <Box padding={1}><Text color="cyan"><Spinner type="dots" /></Text></Box>;

    return (
        <Box flexDirection="column" padding={1} alignItems="center" key="buka-brankas-root">
            <Box borderStyle="round" borderColor="yellow" paddingX={2} marginBottom={1}>
                <Text bold color="yellow">
                    {mode === 'setup' ? '🔐 SETUP NEW VAULT' : (mode === 'mnemonic' ? '🆘 ACCESS RECOVERY' : '🔒 VAULT LOCKED')}
                </Text>
            </Box>

            <Box flexDirection="column" width={50} alignItems="center" key="form-container">
                <Text color="gray" dimColor>
                    {mode === 'setup'
                        ? 'Set a master password to secure your archive.'
                        : (mode === 'mnemonic'
                            ? 'Enter your 12-word recovery mnemonic.'
                            : 'Enter your password to unlock the archive.')}
                </Text>

                <Box marginTop={1} borderStyle="single" borderColor={UI_TOKENS.meta} paddingX={1} width="100%">
                    {mode === 'mnemonic' ? (
                        <TextInput
                            value={mnemonic}
                            onChange={setMnemonic}
                            onSubmit={handleMnemonicSubmit}
                            placeholder="Type recovery phrase here..."
                        />
                    ) : (
                        <TextInput
                            value={password}
                            onChange={setPassword}
                            onSubmit={handlePasswordSubmit}
                            placeholder="Enter master password..."
                            mask="*"
                        />
                    )}
                </Box>

                {isLoading && (
                    <Box marginTop={1} key="loading-box">
                        <Text color={UI_TOKENS.brand}><Spinner type="dots" /> Processing...</Text>
                    </Box>
                )}

                {checksumWarning && !error && (
                    <Box marginTop={1} key="checksum-box">
                        <Text color="yellow">⚠️  {checksumWarning}</Text>
                    </Box>
                )}

                {error && (
                    <Box marginTop={1} key="error-box">
                        <Text color={UI_TOKENS.danger}>❌ {error}</Text>
                    </Box>
                )}

                {!isLoading && (
                    <Box marginTop={1} flexDirection="column" alignItems="center" key="help-box">
                        <Text color={UI_TOKENS.meta} dimColor>Press [Enter] to confirm</Text>
                        {mode === 'unlock' && (
                            <Text color={UI_TOKENS.brand} dimColor>Press [r] to use Recovery Phrase</Text>
                        )}
                        {mode === 'mnemonic' && (
                            <Text color={UI_TOKENS.brand} dimColor>Press [l] to return to login</Text>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};
