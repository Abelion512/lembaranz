import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';

interface LayarBukaBrankasProps {
    onBerhasil: () => void;
}

export const LayarBukaBrankas: React.FC<LayarBukaBrankasProps> = ({ onBerhasil }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInit, setIsInit] = useState<boolean | null>(null);
    const [mode, setMode] = useState<'unlock' | 'setup' | 'mnemonic'>('unlock');
    const [mnemonic, setMnemonic] = useState('');

    useEffect(() => {
        const check = async () => {
            const { Arsip } = await import('@lembaran/core');
            const initialized = await Arsip.isVaultInitialized();
            setIsInit(initialized);
            if (!initialized) setMode('setup');
        };
        check();
    }, []);

    const handlePasswordSubmit = async () => {
        if (password.length < 8) {
            setError('Minimal 8 karakter.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { Arsip } = await import('@lembaran/core');
            if (mode === 'setup') {
                await Arsip.setupVault(password);
                onBerhasil();
            } else {
                const ok = await Arsip.unlockVault(password);
                if (ok) {
                    onBerhasil();
                } else {
                    setError('Kata sandi salah.');
                }
            }
        } catch (_e) {
            setError('Gagal memproses brankas.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMnemonicSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { Arsip } = await import('@lembaran/core');
            const ok = await Arsip.recoverVault(mnemonic);
            if (ok) {
                // Force user to set new password after recovery
                setMode('setup');
                setPassword('');
            } else {
                setError('Kunci kertas tidak valid.');
            }
        } catch (_e) {
            setError('Gagal memulihkan brankas.');
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
        } else if (input === 'l' && mode === 'mnemonic') {
            setMode('unlock');
            setError(null);
        }
    });

    if (isInit === null) return <Box padding={1}><Text color="cyan"><Spinner type="dots" /></Text></Box>;

    return (
        <Box flexDirection="column" padding={1} alignItems="center">
            <Box borderStyle="round" borderColor="yellow" paddingX={2} marginBottom={1}>
                <Text bold color="yellow">
                    {mode === 'setup' ? '🔐 SIAPKAN BRANKAS BARU' : (mode === 'mnemonic' ? '🆘 PEMULIHAN AKSES' : '🔒 BRANKAS TERKUNCI')}
                </Text>
            </Box>

            <Box flexDirection="column" width={50} alignItems="center">
                <Text>
                    {mode === 'setup'
                        ? 'Tetapkan kata sandi utama untuk mengamankan aksara Anda.'
                        : (mode === 'mnemonic'
                            ? 'Masukkan 12 kata kunci pemulihan Anda.'
                            : 'Masukkan kata sandi untuk membuka arsip.')}
                </Text>

                <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1} width="100%">
                    {mode === 'mnemonic' ? (
                        <TextInput
                            value={mnemonic}
                            onChange={setMnemonic}
                            onSubmit={handleMnemonicSubmit}
                            placeholder="Ketik kunci kertas di sini..."
                        />
                    ) : (
                        <TextInput
                            value={password}
                            onChange={setPassword}
                            onSubmit={handlePasswordSubmit}
                            mask="*"
                            placeholder="Masukkan kata sandi..."
                        />
                    )}
                </Box>

                {isLoading && (
                    <Box marginTop={1}>
                        <Text color="cyan"><Spinner type="dots" /> Memproses...</Text>
                    </Box>
                )}

                {error && (
                    <Box marginTop={1}>
                        <Text color="red">❌ {error}</Text>
                    </Box>
                )}

                {!isLoading && (
                    <Box marginTop={1} flexDirection="column" alignItems="center">
                        <Text color="gray" dimColor>Tekan [Enter] untuk konfirmasi</Text>
                        {mode === 'unlock' && (
                            <Text color="blue" dimColor>Tekan [r] untuk menggunakan Kunci Kertas</Text>
                        )}
                        {mode === 'mnemonic' && (
                            <Text color="blue" dimColor>Tekan [l] untuk kembali ke login</Text>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};
