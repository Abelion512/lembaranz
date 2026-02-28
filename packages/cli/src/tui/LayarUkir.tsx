import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';

interface LayarUkirProps {
    onKembali: () => void;
}

export const LayarUkir: React.FC<LayarUkirProps> = ({ onKembali }) => {
    const [step, setStep] = useState<'title' | 'content' | 'saving' | 'error'>('title');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleTitleSubmit = () => {
        if (title.trim()) setStep('content');
    };

    const handleContentSubmit = async () => {
        if (!content.trim()) return;
        setStep('saving');

        try {
            const { Arsip } = await import('@lembaran/core');
            await Arsip.saveNote({
                id: '',
                title: title.trim(),
                content: content.trim(),
                folderId: null,
                isPinned: false,
                isFavorite: false,
                tags: [],
                createdAt: new Date().toISOString()
            });
            onKembali();
        } catch (e: any) {
            setErrorMessage(e.message || 'Gagal menyimpan catatan');
            setStep('error');
        }
    };

    useInput((input, key) => {
        if (key.escape) {
            if (step === 'content') setStep('title');
            else if (step === 'error') setStep('content');
            else onKembali();
        }
        if (step === 'error' && key.return) {
            setStep('content');
        }
    });

    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="round" borderColor="green" paddingX={1} marginBottom={1}>
                <Text bold color="green">📝 UKIR AKSARA BARU</Text>
            </Box>

            {step === 'title' && (
                <Box flexDirection="column">
                    <Text>Masukkan judul catatan:</Text>
                    <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
                        <TextInput
                            value={title}
                            onChange={setTitle}
                            onSubmit={handleTitleSubmit}
                            placeholder="Judul..."
                        />
                    </Box>
                    <Box marginTop={1}>
                        <Text color="gray" dimColor italic>Tekan [Enter] untuk lanjut ke isi</Text>
                    </Box>
                </Box>
            )}

            {step === 'content' && (
                <Box flexDirection="column">
                    <Text>Judul: <Text color="green" bold>{title}</Text></Text>
                    <Box marginTop={1}>
                        <Text>Masukkan isi aksara:</Text>
                    </Box>
                    <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
                        <TextInput
                            value={content}
                            onChange={setContent}
                            onSubmit={handleContentSubmit}
                            placeholder="Ketik isi di sini..."
                        />
                    </Box>
                    <Box marginTop={1}>
                        <Text color="gray" dimColor italic>Tekan [Enter] untuk simpan, [Esc] kembali ke judul</Text>
                    </Box>
                </Box>
            )}

            {step === 'saving' && (
                <Box>
                    <Text color="cyan"><Spinner type="dots" /> Mengabadikan aksara...</Text>
                </Box>
            )}

            {step === 'error' && (
                <Box flexDirection="column">
                    <Text color="red" bold>❌ Terjadi Kesalahan:</Text>
                    <Text color="red">{errorMessage}</Text>
                    <Box marginTop={1}>
                        <Text color="gray" dimColor italic>Tekan [Enter] atau [Esc] untuk kembali mengedit</Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
