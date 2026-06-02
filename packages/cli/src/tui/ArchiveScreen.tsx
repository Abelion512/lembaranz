import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { ModernSelect } from "./components/ModernSelect.js";
import { Note } from "@lembaranz/core";
import { UI_TOKENS } from "./theme.js";

interface ArchiveScreenProps {
  onBack: () => void;
  initialSearch?: string;
}

const cleanTextForDisplay = (text: string): string => {
  if (!text) return "";
  // 🛡️ Sentinel: Safe text rendering
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
};

const cleanTextForSearch = (text: string): string => {
  if (!text) return "";
  return text.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
};

export const ArchiveScreen: React.FC<ArchiveScreenProps> = ({
  onBack,
  initialSearch,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchableNotes, setSearchableNotes] = useState<
    { id: string; title: string; tokens: string[]; searchContent: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch || "");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { Archive } = await import("@lembaranz/core");
        const result = await Archive.getAllNotes();
        if (!result.error) {
          const data = result.data || [];
          setNotes(data);

          // ⚡ Bolt: Pre-compute searchable data to avoid expensive regex/lowercase in filter loop
          const indexed = data.map((n) => ({
            id: n.id,
            title: (n.title || "").toLowerCase(),
            tokens: (n.tags || []).map((t) => t.toLowerCase()),
            searchContent: cleanTextForSearch(n.content || "").toLowerCase(),
          }));
          setSearchableNotes(indexed);
        }
      } catch (_e) {
        // Silently fail to keep TUI alive
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return notes;

    return searchableNotes
      .filter(
        (sn) =>
          sn.title.includes(query) ||
          sn.tokens.some((t) => t.includes(query)) ||
          sn.searchContent.includes(query)
      )
      .map((sn) => notes.find((n) => n.id === sn.id)!);
  }, [notes, searchableNotes, search]);

  const selectItems = useMemo(
    () =>
      filteredNotes.map((n) => ({ label: n.title || "Untitled", value: n.id })),
    [filteredNotes]
  );

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId),
    [notes, selectedNoteId]
  );

  useInput((input, key) => {
    if (key.escape || (input === "q" && !selectedNoteId)) {
      if (selectedNoteId) setSelectedNoteId(null);
      else onBack();
    }
  });

  if (isLoading)
    return (
      <Box padding={1}>
        <Text color={UI_TOKENS.accent}>
          <Spinner type="dots" /> Opening archives...
        </Text>
      </Box>
    );

  if (selectedNoteId && selectedNote) {
    return (
      <Box flexDirection="column" padding={1} key="note-detail-container">
        <Box
          borderStyle="round"
          borderColor={UI_TOKENS.brand}
          paddingX={1}
          marginBottom={1}
        >
          <Text bold color={UI_TOKENS.brand}>
            📖 {selectedNote.title || "Untitled"}
          </Text>
        </Box>
        <Box flexDirection="column" paddingX={1}>
          <Text color={UI_TOKENS.meta}>Created: {selectedNote.createdAt}</Text>
          <Box
            marginY={1}
            borderStyle="single"
            borderColor={UI_TOKENS.meta}
            padding={1}
          >
            <Text color={UI_TOKENS.text}>
              {cleanTextForDisplay(selectedNote.content) || "(Empty Note)"}
            </Text>
          </Box>
          <Box>
            {selectedNote.tags?.map((t, idx) => (
              <Text key={`${t}-${idx}`} color={UI_TOKENS.accent}>
                {" "}
                #{t}
              </Text>
            ))}
          </Box>
        </Box>
        <Box marginTop={1} paddingX={1}>
          <Text color={UI_TOKENS.meta} dimColor italic>
            Press [Esc] or [q] to return to list
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1} key="arsip-list-container">
      <Box
        borderStyle="round"
        borderColor={UI_TOKENS.accent}
        paddingX={1}
        marginBottom={1}
        justifyContent="space-between"
      >
        <Text color={UI_TOKENS.accent} bold>
          📂 BROWSE ARCHIVES
        </Text>
        <Text color={UI_TOKENS.meta}>[{filteredNotes.length} notes]</Text>
      </Box>

      <Box paddingX={1} marginBottom={1}>
        <Text bold color={UI_TOKENS.brand}>
          🔍 Search:{" "}
        </Text>
        <TextInput
          value={search}
          onChange={setSearch}
          placeholder="Type title, tag, or content..."
        />
      </Box>

      <Box paddingX={1} flexDirection="column" minHeight={5}>
        {filteredNotes.length === 0 ? (
          <Text color={UI_TOKENS.meta}>
            ⚠️ No notes found matching your query.
          </Text>
        ) : (
          <ModernSelect
            items={selectItems}
            limit={10}
            onSelect={(item) => setSelectedNoteId(item.value)}
          />
        )}
      </Box>

      <Box marginTop={1} paddingX={1}>
        <Text color={UI_TOKENS.meta} dimColor italic>
          Use [j/k] or arrows to navigate, [Enter] to open, [Esc] to exit
        </Text>
      </Box>
    </Box>
  );
};
