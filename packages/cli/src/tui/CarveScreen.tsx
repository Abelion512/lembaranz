import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { UI_TOKENS } from './theme.js';

interface CarveScreenProps {
    onBack: () => void;
}

export const CarveScreen: React.FC<CarveScreenProps> = ({ onBack }) => {
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
            const { Archive } = await import('@lembaranzz/core');
            const result = await Archive.saveNote({
                id: '',
                title: title.trim(),
                content: content.trim(),
                folderId: null,
                isPinned: false,
                isFavorite: false,
                tags: [],
                createdAt: new Date().toISOString()
            });

            if (result.error) {
                setErrorMessage(result.error.message || 'Failed to save entry');
                setStep('error');
            } else {
                onBack();
            }
        } catch (e: unknown) {
            setErrorMessage((e as Error).message || 'System error during save operation');
            setStep('error');
        }
    };

    useInput((input, key) => {
        if (key.escape) {
            if (step === 'content') setStep('title');
            else if (step === 'error') setStep('content');
            else onBack();
        }
        if (step === 'error' && key.return) {
            setStep('content');
        }
    });

    return (
        <Box flexDirection="column" padding={1} key="carve-root">
            <Box borderStyle="round" borderColor={UI_TOKENS.brand} paddingX={1} marginBottom={1}>
                <Text bold color={UI_TOKENS.brand}>📝 CREATE NEW ENTRY</Text>
            </Box>

            {step === 'title' && (
                <Box flexDirection="column" key="step-title">
                    <Text>Enter entry title:</Text>
                    <Box marginTop={1} borderStyle="single" borderColor={UI_TOKENS.meta} paddingX={1}>
                        <TextInput
                            value={title}
                            onChange={setTitle}
                            onSubmit={handleTitleSubmit}
                            placeholder="Title..."
                        />
                    </Box>
                    <Box marginTop={1}>
                        <Text color={UI_TOKENS.meta} dimColor italic>Press [Enter] to continue to content</Text>
                    </Box>
                </Box>
            )}

            {step === 'content' && (
                <Box flexDirection="column" key="step-content">
                    <Text>Title: <Text color={UI_TOKENS.brand} bold>{title}</Text></Text>
                    <Box marginTop={1}>
                        <Text>Enter entry content:</Text>
                    </Box>
                    <Box marginTop={1} borderStyle="single" borderColor={UI_TOKENS.meta} paddingX={1}>
                        <TextInput
                            value={content}
                            onChange={setContent}
                            onSubmit={handleContentSubmit}
                            placeholder="Type content here..."
                        />
                    </Box>
                    <Box marginTop={1}>
                        <Text color={UI_TOKENS.meta} dimColor italic>Press [Enter] to save, [Esc] return to title</Text>
                    </Box>
                </Box>
            )}

            {step === 'saving' && (
                <Box key="step-saving">
                    <Text color={UI_TOKENS.accent}><Spinner type="dots" /> Saving entry to vault...</Text>
                </Box>
            )}

            {step === 'error' && (
                <Box flexDirection="column" key="step-error">
                    <Text color={UI_TOKENS.danger} bold>❌ Error Occurred:</Text>
                    <Text color={UI_TOKENS.danger}>{errorMessage}</Text>
                    <Box marginTop={1}>
                        <Text color={UI_TOKENS.meta} dimColor italic>Press [Enter] or [Esc] to return to editor</Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
