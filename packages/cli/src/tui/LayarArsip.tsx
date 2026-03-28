import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { PilihanModern } from './komponen/PilihanModern.js';
import { Note } from '@lembaran/core';

interface LayarArsipProps {
    onKembali: () => void;
}

/**
 * Membersihkan konten untuk tampilan (konservatif).
 * Hanya membuang tag HTML dan decode entitas. Menjaga karakter Markdown.
 */
const bersihkanAksaraTampilan = (teks: string): string => {
    if (!teks) return '';
    return teks
        .replace(/<[^>]*>/g, '') // Strip HTML
        .replace(/&[#a-z0-9]+;/gi, ' ') // Strip Entities
        .trim();
};

/**
 * Membersihkan konten untuk pencarian (agresif).
 * Membuang noise Markdown agar pencarian kata kunci lebih akurat.
 */
const bersihkanAksaraPencarian = (teks: string): string => {
    if (!teks) return '';
    return teks
        .replace(/<[^>]*>/g, '') // Strip HTML
        .replace(/&[#a-z0-9]+;/gi, ' ') // Strip Entities
        .replace(/[#*`~_]/g, '') // Strip aggressive Markdown noise
        .replace(/\n+/g, ' ') // Flatten newlines
        .trim();
};

export const LayarArsip: React.FC<LayarArsipProps> = ({ onKembali }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { Arsip } = await import('@lembaran/core');
                const all = await Arsip.getAllNotes();
                setNotes(all || []);
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
            // Gunakan konten yang dibersihkan secara agresif untuk pencarian
            const content = bersihkanAksaraPencarian(n.content || '').toLowerCase();

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
            else onKembali();
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
                        <Text>{bersihkanAksaraTampilan(selectedNote.content) || '(Catatan Kosong)'}</Text>
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
                <TextInput value={search} onChange={setSearch} placeholder="Ketik judul, tag, atau isi..." />
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
