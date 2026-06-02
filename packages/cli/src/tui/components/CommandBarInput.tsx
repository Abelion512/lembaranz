import React, { useState, useEffect } from 'react';
import { Box, useInput, Text } from 'ink';
import TextInput from 'ink-text-input';

interface CommandBarInputProps {
    onSubmit: (command: string) => void;
    history: string[];
    suggestions: string[];
}

export const InputBilahPerintah: React.FC<CommandBarInputProps> = ({ onSubmit, history, suggestions }) => {
    const [value, setNilai] = useState('');
    const [historyIndex, setIndeksRiwayat] = useState(-1);
    const [suggestion, setSuggestion] = useState('');

    useEffect(() => {
        if (value.startsWith('/')) {
            const cari = suggestions.find(s => s.startsWith(value));
            setSuggestion(cari ? cari.slice(value.length) : '');
        } else {
            setSuggestion('');
        }
    }, [value, suggestions]);

    useInput((input, key) => {
        if (key.upArrow) {
            if (history.length > 0 && historyIndex < history.length - 1) {
                const nextIndex = historyIndex + 1;
                setIndeksRiwayat(nextIndex);
                setNilai(history[history.length - 1 - nextIndex] || '');
            }
            return;
        }
        
        if (key.downArrow) {
            if (historyIndex > 0) {
                const prevIndex = historyIndex - 1;
                setIndeksRiwayat(prevIndex);
                setNilai(history[history.length - 1 - prevIndex] || '');
            } else if (historyIndex === 0) {
                setIndeksRiwayat(-1);
                setNilai('');
            }
            return;
        }

        if (key.tab && suggestion) {
            setNilai(value + suggestion);
            setSuggestion('');
        }
    });

    const handleSubmit = (v: string) => {
        if (v.trim()) {
            onSubmit(v.trim());
            setNilai('');
            setIndeksRiwayat(-1);
            setSuggestion('');
        }
    };

    return (
        <Box>
            <Text color="cyan">Lembaranz {'>'} </Text>
            <TextInput 
                value={value} 
                onChange={setNilai} 
                onSubmit={handleSubmit} 
                placeholder="Type /help to see commands..."
            />
            {suggestion && <Text color="gray" dimColor>{suggestion} (Tab)</Text>}
        </Box>
    );
};
