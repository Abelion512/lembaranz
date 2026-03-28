import React, { useState, useEffect } from 'react';
import { Box, useInput, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputBilahPerintahProps {
    onSubmit: (perintah: string) => void;
    riwayat: string[];
    saran: string[];
}

export const InputBilahPerintah: React.FC<InputBilahPerintahProps> = ({ onSubmit, riwayat, saran }) => {
    const [nilai, setNilai] = useState('');
    const [indeksRiwayat, setIndeksRiwayat] = useState(-1);
    const [suggestion, setSuggestion] = useState('');

    useEffect(() => {
        if (nilai.startsWith('/')) {
            const cari = saran.find(s => s.startsWith(nilai));
            setSuggestion(cari ? cari.slice(nilai.length) : '');
        } else {
            setSuggestion('');
        }
    }, [nilai, saran]);

    useInput((input, key) => {
        if (key.upArrow) {
            if (riwayat.length > 0 && indeksRiwayat < riwayat.length - 1) {
                const nextIndex = indeksRiwayat + 1;
                setIndeksRiwayat(nextIndex);
                setNilai(riwayat[riwayat.length - 1 - nextIndex] || '');
            }
            return;
        }
        
        if (key.downArrow) {
            if (indeksRiwayat > 0) {
                const prevIndex = indeksRiwayat - 1;
                setIndeksRiwayat(prevIndex);
                setNilai(riwayat[riwayat.length - 1 - prevIndex] || '');
            } else if (indeksRiwayat === 0) {
                setIndeksRiwayat(-1);
                setNilai('');
            }
            return;
        }

        if (key.tab && suggestion) {
            setNilai(nilai + suggestion);
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
            <Text color="cyan">Lembaran {'>'} </Text>
            <TextInput 
                value={nilai} 
                onChange={setNilai} 
                onSubmit={handleSubmit} 
                placeholder="Ketik /bantuan untuk melihat perintah..."
            />
            {suggestion && <Text color="gray" dimColor>{suggestion} (Tab)</Text>}
        </Box>
    );
};
