import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';

interface LayarKredensialProps {
    onKembali: () => void;
}

export const LayarKredensial: React.FC<LayarKredensialProps> = ({ onKembali }) => {
    const [step, setStep] = useState<'label' | 'username' | 'password' | 'saving'>('label');
    const [data, setData] = useState({ label: '', username: '', password: '' });

    const handleSubmit = async () => {
        if (step === 'label') setStep('username');
        else if (step === 'username') setStep('password');
        else if (step === 'password') {
            setStep('saving');
            try {
                const { Arsip, Brankas } = await import('@lembaran/core');

                // Cek apakah vault sudah dibuka
                if (Brankas.isLocked()) {
                    console.error('\n❌ Brankas terkunci! Silakan buka brankas terlebih dahulu dengan perintah: lembaran mulai');
                    onKembali();
                    return;
                }

                await Arsip.saveNote({
                    id: '',
                    title: `🛡️ ${data.label}`,
                    content: `Kredensial untuk ${data.label}`,
                    folderId: null,
                    isPinned: true,
                    isFavorite: false,
                    isCredentials: true,
                    kredensial: {
                        username: data.username,
                        password: data.password,
                        url: ''
                    },
                    tags: ['Kredensial'],
                    createdAt: new Date().toISOString()
                });
                console.error('\n✅ Kredensial berhasil disimpan!');
                onKembali();
            } catch (e) {
                console.error('\n❌ Gagal menyimpan:', e instanceof Error ? e.message : String(e));
                onKembali();
            }
        }
    };

    useInput((input, key) => {
        if (key.escape) onKembali();
    });

    return (
        <Box flexDirection="column" padding={1} key="kredensial-root">
            <Box borderStyle="round" borderColor="magenta" paddingX={1} marginBottom={1}>
                <Text bold color="magenta">🔑 TANAM KREDENSIAL BARU</Text>
            </Box>

            <Box flexDirection="column" key="kredensial-form">
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
                        <Text color="cyan"><Spinner type="dots" /> Menyimpan kredensial...</Text>
                    </Box>
                )}
            </Box>

            <Box marginTop={1}>
                <Text color="gray" dimColor italic>Tekan [Enter] untuk lanjut, [Esc] kembali</Text>
            </Box>
        </Box>
    );
};
