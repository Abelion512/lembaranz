import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { ModernSelect } from './components/ModernSelect.js';
import { Note } from '@lembaranz/core';

interface ArchiveScreenProps {
    onBack: () => void;
    initialSearch?: string;
    isFocused?: boolean;
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

export const ArchiveScreen: React.FC<ArchiveScreenProps> = ({ onBack, initialSearch, isFocused = true }) => {
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
        if (!isFocused) return;
        if (key.escape || (input === 'q' && !selectedNoteId)) {
            if (selectedNoteId) setSelectedNoteId(null);
            else onBack();
        }
    });

    if (isLoading) return <Box padding={1}><Text color="cyan"><Spinner type="dots" /> Opening archive...</Text></Box>;

    if (selectedNoteId && selectedNote) {
        return (
            <Box flexDirection="column" paddingX={2} key="note-detail-container">
                <Box borderStyle="single" borderColor="cyan" paddingX={1} marginBottom={1}>
                    <Text bold color="cyan">📖 {selectedNote.title || 'Untitled'}</Text>
                </Box>
                <Box flexDirection="column">
                    <Text color="gray" dimColor>Created: {selectedNote.createdAt}</Text>
                    <Box marginY={1} paddingX={1} minHeight={10}>
                        <Text>{cleanTextForDisplay(selectedNote.content) || '(Empty Note)'}</Text>
                    </Box>
                    <Box paddingX={1}>
                        {selectedNote.tags?.map((t, idx) => (
                            <Box key={`${t}-${idx}`} marginRight={1}>
                                <Text color="blue" bold>#</Text>
                                <Text color="blue">{t}</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box marginTop={1}>
                    <Text color="gray" dimColor italic>⎯⎯  [Esc] Back to Table</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingX={2} key="arsip-list-container">
            {/* Minimal Sub-Header */}
            <Box marginBottom={1} justifyContent="space-between">
                <Box>
                    <Text color="cyan" bold>EXPLORE ARCHIVE</Text>
                    <Text color="gray"> · {filteredNotes.length}/{notes.length} items</Text>
                </Box>
                {search && <Text color="yellow" dimColor>Filter: "{search}"</Text>}
            </Box>

            {/* Integrated Search Bar */}
            <Box marginBottom={1}>
                <Text color="gray" dimColor>🔍 </Text>
                <TextInput value={search} onChange={setSearch} placeholder="search title, tags..." />
            </Box>

            {/* Table Header */}
            <Box paddingX={1} marginBottom={1}>
                <Box width={6}><Text color="gray" bold>ID</Text></Box>
                <Box width={30}><Text color="gray" bold>NAME</Text></Box>
                <Box><Text color="gray" bold>TAGS</Text></Box>
            </Box>

            {/* Table Rows */}
            <Box flexDirection="column" minHeight={8}>
                {filteredNotes.length === 0 ? (
                    <Box paddingX={1}>
                        <Text color="yellow" dimColor>No records found matching your query.</Text>
                    </Box>
                ) : (
                    <ModernSelect
                        items={filteredNotes.map((n, idx) => ({ 
                            label: (
                                <Box>
                                    <Box width={6}><Text color={selectedNoteId === n.id ? 'cyan' : 'gray'}>{(idx + 1).toString().padStart(2, '0')}</Text></Box>
                                    <Box width={30}><Text bold={selectedNoteId === n.id}>{n.title || 'Untitled'}</Text></Box>
                                    <Box><Text color="blue" dimColor>{(n.tags || []).slice(0, 2).map(t => `#${t}`).join(' ')}</Text></Box>
                                </Box>
                            ) as any, 
                            value: n.id,
                            key: n.id 
                        }))}
                        limit={10}
                        onSelect={(item) => setSelectedNoteId(item.value)}
                        isFocused={isFocused}
                    />
                )}
            </Box>

            <Box marginTop={1} justifyContent="space-between">
                <Text color="gray" dimColor italic>j/k:move · enter:open · esc:back</Text>
            </Box>
        </Box>
    );
};

