import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { UI_TOKENS } from './theme.js';

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
                const { Archive, Vault } = await import('@lembaranzz/core');

                if (Vault.isLocked()) {
                    console.error('\n❌ Vault locked! Please unlock the vault first using: lembaranzz launch');
                    onBack();
                    return;
                }

                await Archive.saveNote({
                    id: '',
                    title: `🔒 ${data.label}`,
                    content: `Credentials for ${data.label}`,
                    folderId: null,
                    isPinned: true,
                    isFavorite: false,
                    isCredentials: true,
                    credentials: {
                        username: data.username,
                        password: data.password,
                        url: ''
                    },
                    tags: ['Credential'],
                    createdAt: new Date().toISOString()
                });
                console.error('\n✅ Credentials saved successfully!');
                onBack();
            } catch (e) {
                console.error('\n❌ Save failed:', e instanceof Error ? e.message : String(e));
                onBack();
            }
        }
    };

    useInput((input, key) => {
        if (key.escape) onBack();
    });

    return (
        <Box flexDirection="column" padding={1} key="credentials-root">
            <Box borderStyle="round" borderColor={UI_TOKENS.brand} paddingX={1} marginBottom={1}>
                <Text bold color={UI_TOKENS.brand}>🔑 STORE NEW CREDENTIALS</Text>
            </Box>

            <Box flexDirection="column" key="credentials-form">
                {step === 'label' && (
                    <>
                        <Text color={UI_TOKENS.text}>Service Name:</Text>
                        <Box marginTop={1} borderStyle="single" borderColor={UI_TOKENS.brand} paddingX={1}>
                            <TextInput value={data.label} onChange={(v) => setData({ ...data, label: v })} onSubmit={handleSubmit} placeholder="Example: GitHub, Production Server..." />
                        </Box>
                    </>
                )}
                {step === 'username' && (
                    <>
                        <Text color={UI_TOKENS.text}>Username / Email:</Text>
                        <Box marginTop={1} borderStyle="single" borderColor={UI_TOKENS.brand} paddingX={1}>
                            <TextInput value={data.username} onChange={(v) => setData({ ...data, username: v })} onSubmit={handleSubmit} placeholder="Username..." />
                        </Box>
                    </>
                )}
                {step === 'password' && (
                    <>
                        <Text color={UI_TOKENS.text}>Password:</Text>
                        <Box marginTop={1} borderStyle="single" borderColor={UI_TOKENS.brand} paddingX={1}>
                            <TextInput value={data.password} onChange={(v) => setData({ ...data, password: v })} onSubmit={handleSubmit} mask="*" placeholder="Password..." />
                        </Box>
                    </>
                )}
                {step === 'saving' && (
                    <Box key="step-saving">
                        <Text color={UI_TOKENS.accent}><Spinner type="dots" /> Saving credentials...</Text>
                    </Box>
                )}
            </Box>

            <Box marginTop={1}>
                <Text color={UI_TOKENS.meta} dimColor italic>Press [Enter] to continue, [Esc] to go back</Text>
            </Box>
        </Box>
    );
};
