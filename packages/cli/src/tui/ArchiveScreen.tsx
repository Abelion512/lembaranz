import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { PilihanModern } from './components/PilihanModern.js';
import { Note } from '@lembaranz/core';

interface ArchiveScreenProps {
    onBack: () => void;
    initialSearch?: string;
}

/**
 * Membersihkan content untuk tampilan (konservatif).
 * Hanya membuang tag HTML dan decode entitas. Menjaga karakter Markdown.
 */
const cleanTextForDisplay = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '') // Strip HTML
        .replace(/&[#a-z0-9]+;/gi, ' ') // Strip Entities
        .trim();
};

/**
 * Membersihkan content untuk pencarian (agresif).
 * Membuang noise Markdown agar pencarian kata kunci lebih akurat.
 */
const cleanTextForSearch = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '') // Strip HTML
        .replace(/&[#a-z0-9]+;/gi, ' ') // Strip Entities
        .replace(/[#*`~_]/g, '') // Strip aggressive Markdown noise
        .replace(/\n+/g, ' ') // Flatten newlines
        .trim();
};

export const LayarArsip: React.FC<ArchiveScreenProps> = ({ onBack, initialSearch }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState(initialSearch || '');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { Archive } = await import('@lembaranz/core');
                const result = await Archive.getAllNotes();
                if (result.error) {
                    // Tampilkan galat jika diperlukan, atau biarkan kosong
                    setNotes([]);
                } else {
                    setNotes(result.data || []);
                }
            } catch (_e) {
                // Keep TUI running
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const filteredNotes = useMemo(() => {
        const query = search.toLowerCase();
        return (notes || []).filter(n => {
            const title = (n.title || '').toLowerCase();
            const tags = (n.tags || []).map(t => t.toLowerCase());
            // Gunakan content yang dibersihkan secara agresif untuk pencarian
            const content = cleanTextForSearch(n.content || '').toLowerCase();

            return title.includes(query) ||
                tags.some(t => t.includes(query)) ||
                content.includes(query);
        });
    }, [notes, search]);

    const selectedNote = useMemo(() =>
        notes.find(n => n.id === selectedNoteId),
        [notes, selectedNoteId]);

    useInput((input, key) => {
        if (key.escape || (input === 'q' && !selectedNoteId)) {
            if (selectedNoteId) setSelectedNoteId(null);
            else onBack();
        }
    });

    if (isLoading) return <Box padding={1}><Text color="cyan"><Spinner type="dots" /> Membuka arsip...</Text></Box>;

    if (selectedNoteId && selectedNote) {
        return (
            <Box flexDirection="column" padding={1} key="note-detail-container">
                <Box borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
                    <Text bold color="cyan">📖 {selectedNote.title || 'Tanpa Judul'}</Text>
                </Box>
                <Box flexDirection="column" paddingX={1}>
                    <Text color="gray" dimColor>Dibuat: {selectedNote.createdAt}</Text>
                    <Box marginY={1} borderStyle="single" borderColor="gray" padding={1}>
                        {/* Gunakan pembersihan konservatif untuk tampilan detail agar Markdown tetap utuh */}
                        <Text>{cleanTextForDisplay(selectedNote.content) || '(Catatan Kosong)'}</Text>
                    </Box>
                    <Box>
                        {selectedNote.tags?.map((t, idx) => <Text key={`${t}-${idx}`} color="blue"> #{t}</Text>)}
                    </Box>
                </Box>
                <Box marginTop={1} paddingX={1}>
                    <Text color="gray" dimColor italic>Tekan [Esc] atau [q] untuk kembali ke daftar</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1} key="arsip-list-container">
            <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1} justifyContent="space-between">
                <Text color="blue" bold>📂 JELAJAH ARSIP</Text>
                <Text color="gray">[{filteredNotes.length} catatan]</Text>
            </Box>

            <Box paddingX={1} marginBottom={1}>
                <Text bold>🔍 Cari: </Text>
                <TextInput value={search} onChange={setSearch} placeholder="Ketik title, tag, atau isi..." />
            </Box>

            <Box paddingX={1} flexDirection="column" minHeight={5}>
                {filteredNotes.length === 0 ? (
                    <Text color="yellow">⚠️ Tidak ada catatan yang ditemukan.</Text>
                ) : (
                    <PilihanModern
                        items={filteredNotes.map(n => ({ label: n.title || 'Tanpa Judul', value: n.id }))}
                        limit={10}
                        onSelect={(item) => setSelectedNoteId(item.value)}
                    />
                )}
            </Box>

            <Box marginTop={1} paddingX={1}>
                <Text color="gray" dimColor italic>Gunakan [j/k] atau panah untuk navigasi, [Enter] untuk buka, [Esc] kembali</Text>
            </Box>
        </Box>
    );
};
