import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';

interface CredentialsScreenProps {
    onBack: () => void;
}

export const CredentialsScreen: React.FC<CredentialsScreenProps> = ({ onBack }) => {
    const [step, setStep] = useState<'label' | 'username' | 'password' | 'saving'>('label');
    const [data, setData] = useState({ label: '', username: '', password: '' });

    const handleSubmit = async () => {
        if (step === 'label') setStep('username');
        else if (step === 'username') setStep('password');
        else if (step === 'password') {
            setStep('saving');
            try {
                const { Archive, Vault } = await import('@lembaranz/core');

                // Cek apakah vault sudah dibuka
                if (Vault.isLocked()) {
                    console.error('\n❌ Vault locked! Silakan buka brankas terlebih dahulu dengan command: lembaranz mulai');
                    onBack();
                    return;
                }

                await Archive.saveNote({
                    id: '',
                    title: `🛡️ ${data.label}`,
                    content: `Kredensial untuk ${data.label}`,
                    folderId: null,
                    isPinned: true,
                    isFavorite: false,
                    isCredentials: true,
                    credentials: {
                        username: data.username,
                        password: data.password,
                        url: ''
                    },
                    tags: ['Kredensial'],
                    createdAt: new Date().toISOString()
                });
                console.error('\n✅ Kredensial berhasil disimpan!');
                onBack();
            } catch (e) {
                console.error('\n❌ Gagal menyimpan:', e instanceof Error ? e.message : String(e));
                onBack();
            }
        }
    };

    useInput((input, key) => {
        if (key.escape) onBack();
    });

    return (
        <Box flexDirection="column" padding={1} key="credentials-root">
            <Box borderStyle="round" borderColor="magenta" paddingX={1} marginBottom={1}>
                <Text bold color="magenta">🔑 TANAM KREDENSIAL BARU</Text>
            </Box>

            <Box flexDirection="column" key="credentials-form">
                {step === 'label' && (
                    <>
                        <Text>Nama Layanan:</Text>
                        <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
                            <TextInput value={data.label} onChange={(v) => setData({ ...data, label: v })} onSubmit={handleSubmit} placeholder="Contoh: GitHub, Server production..." />
                        </Box>
                    </>
                )}
                {step === 'username' && (
                    <>
                        <Text>Username / Email:</Text>
                        <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
                            <TextInput value={data.username} onChange={(v) => setData({ ...data, username: v })} onSubmit={handleSubmit} placeholder="Username..." />
                        </Box>
                    </>
                )}
                {step === 'password' && (
                    <>
                        <Text>Password:</Text>
                        <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
                            <TextInput value={data.password} onChange={(v) => setData({ ...data, password: v })} onSubmit={handleSubmit} mask="*" placeholder="Password..." />
                        </Box>
                    </>
                )}
                {step === 'saving' && (
                    <Box key="step-saving">
                        <Text color="cyan"><Spinner type="dots" /> Menyimpan credentials...</Text>
                    </Box>
                )}
            </Box>

            <Box marginTop={1}>
                <Text color="gray" dimColor italic>Tekan [Enter] untuk lanjut, [Esc] kembali</Text>
            </Box>
        </Box>
    );
};
