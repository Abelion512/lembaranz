/**
 * The vault workspace, reached after the lock screen has opened the vault.
 *
 * Flow notes that came out of testing this against a real server:
 *
 *  - The old version read notes with `if (res.data) setNotes(...)` and ignored
 *    errors entirely. Locking the vault therefore produced a silently stale or
 *    empty list with no explanation and no way back in, because the only way to
 *    enter a master password lived on the screen the user had just left. Every
 *    vault read now goes through `run`, which hands a `locked` result back to
 *    the lock screen instead of swallowing it.
 *  - The "Env Manager" tab was two buttons that did nothing and one hardcoded
 *    profile row. It is gone, replaced by a live audit-chain view.
 *  - "LEMBARANZ V3" was hardcoded in four places while the landing page showed a
 *    different version. One source of truth now.
 *
 * The workspace uses the same charcoal, cream and sand system as the landing
 * page, so opening the vault feels like walking through the door rather than
 * switching products. Hierarchy comes from the three luminance steps in the
 * Tailwind theme rather than from borders, which keeps a dense screen calm.
 *
 * Accessibility kept from the original: real tab semantics with `aria-selected`
 * and matching panels, focusable note rows with Enter and Space, and 44px
 * minimum targets. Copied secrets are wiped after 30s, but only when the
 * clipboard still holds exactly what we wrote.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Lock, Plus, Save, Search, Trash2 } from 'lucide-react';
import type { DecryptedNote, NoteInput } from '@lembaranz/core';
import { api, baseUrl, consumeConnectLink, isConnected } from './api';
import { ConnectScreen } from './ConnectScreen';
import { LockScreen } from './LockScreen';
import { IntegrityPanel } from './IntegrityPanel';

/** How long a copied secret may sit in the system clipboard. */
const CLIPBOARD_WIPE_MS = 30000;

/** Apple HIG minimum hit target. */
const TAP_TARGET = 'min-h-[44px] min-w-[44px]';

/**
 * The editor fields were the real offenders: the title input sat in a 56px row
 * with `items-center`, so it kept its natural 24px height rather than
 * stretching, and the tag input was 20px. A search box at 40px missed the mark
 * by four. All three now declare the floor instead of arriving at it through
 * padding arithmetic.
 */
/* `placeholder:text-faint` is undimmed on purpose. Faint is already 5.3:1 on
   the dark grounds, and dimming it by 30% drops the placeholder to 3.3:1, which
   is under WCAG AA for the text it stands in for. `outline-none` is gone too:
   it suppressed the focus ring on the fields where you type a master password,
   which is the last place that should lose one. */
const FIELD = `${TAP_TARGET} bg-transparent placeholder:text-faint`;
const FIELD_BOXED = `${TAP_TARGET} rounded-xl border border-line bg-ink-soft placeholder:text-faint`;

type Tab = 'entries' | 'integrity';

export default function App() {
  // The vault lives in a server process; without its address and token there is
  // nothing to talk to, so the connect screen comes first.
  const [connected, setConnected] = useState(isConnected());
  // A connect link from `lembaranz server` carries the origin and token in the
  // fragment. Consuming it here means the user never sees the connect form at
  // all on the happy path.
  const [paired, setPaired] = useState(() => consumeConnectLink());

  if (!connected && !paired) {
    return <ConnectScreen onConnected={() => setConnected(true)} />;
  }

  return (
    <VaultApp
      key={baseUrl()}
      onDisconnect={() => {
        sessionStorage.clear();
        setConnected(false);
        setPaired(false);
      }}
    />
  );
}

const VaultApp: React.FC<{ onDisconnect: () => void }> = ({ onDisconnect }) => {
  const { t } = useTranslation();

  const [hasVault, setHasVault] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [activeNote, setActiveNote] = useState<DecryptedNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<Tab>('entries');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  /**
   * Runs a vault call, treating "locked" as a session event rather than an error.
   *
   * The vault can lock underneath the UI at any time (the server process holds
   * the key, so `POST /lock` from anywhere, an idle timeout, or a restart makes
   * every subsequent call fail). Treating that as an ordinary error is what left
   * users staring at an empty vault with no way back in.
   */
  const run = useCallback(
    async <T,>(operation: () => Promise<{ data: T; error: null } | { data: null; error: { message: string; code: string | null } }>) => {
      const res = await operation();
      if (res.error?.code === 'locked') setIsUnlocked(false);
      return res;
    },
    []
  );

  useEffect(() => {
    void (async () => {
      const res = await api.status();
      if (res.data) {
        setHasVault(res.data.setup);
        // The server may already hold an unlocked session from a reload.
        if (res.data.setup && !res.data.locked) setIsUnlocked(true);
      } else {
        setHasVault(null);
      }
    })();
  }, []);

  const refreshNotes = useCallback(async () => {
    const res = await run(() => api.listNotes());
    if (res.data) setNotes(res.data);
  }, [run]);

  useEffect(() => {
    if (isUnlocked) void refreshNotes();
  }, [isUnlocked, refreshNotes]);

  const openNote = async (note: DecryptedNote) => {
    const res = await run(() => api.getNote(note.id));
    if (!res.data) return;
    setActiveNote(res.data);
    setNoteTitle(res.data.title);
    setNoteContent(res.data.content);
    setNoteTags(res.data.tags?.join(', ') ?? '');
  };

  const newNote = () => {
    setActiveNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
  };

  const save = async () => {
    if (!noteTitle.trim()) return;
    setBusy(true);
    try {
      const input: NoteInput = {
        id: activeNote?.id || undefined,
        title: noteTitle,
        content: noteContent,
        folderId: null,
        isPinned: false,
        isFavorite: false,
        tags: noteTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      const res = await run(() => api.saveNote(input));
      const saved = res.data;
      if (!saved) return;
      await refreshNotes();
      // The save response is the stored (still sealed) note, so re-read it to
      // get the decrypted fields rather than echoing the sealed ones back.
      const decrypted = await run(() => api.getNote(saved.id));
      if (decrypted.data) setActiveNote(decrypted.data);
      setSavedAt(Date.now());
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('vault.deleteConfirm'))) return;
    await run(() => api.deleteNote(id));
    newNote();
    await refreshNotes();
  };

  /**
   * Copy note content, then wipe the clipboard.
   *
   * A copied secret otherwise stays in the system clipboard until something
   * else overwrites it. The wipe is conditional: it clears only when the
   * clipboard still holds exactly what we wrote, so a later copy by the user is
   * never destroyed. `readText` needs clipboard-read permission and fails on
   * insecure origins; in that case the value is left alone.
   */
  const copy = (text: string, id: string) => {
    void navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
    window.setTimeout(() => {
      navigator.clipboard
        .readText()
        .then((current) => {
          if (current === text) void navigator.clipboard.writeText('');
        })
        .catch(() => {});
    }, CLIPBOARD_WIPE_MS);
  };

  const lock = () => {
    void api.lock();
    setIsUnlocked(false);
    setActiveNote(null);
    setNotes([]);
    newNote();
  };

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  if (hasVault === null) {
    return (
      <div className="hero-field flex h-screen w-screen items-center justify-center text-faint">
        <span className="fade-up text-sm">{t('vault.verify')}...</span>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <LockScreen
        hasVault={hasVault}
        onUnlocked={() => {
          setHasVault(true);
          setIsUnlocked(true);
        }}
        onDisconnect={onDisconnect}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <aside className="flex min-h-0 w-80 shrink-0 flex-col border-r border-line bg-ink-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="font-display text-[17px] text-cream">{t('lock.title')}</span>
          <button
            type="button"
            onClick={lock}
            title={t('lock.lock')}
            aria-label={t('lock.lock')}
            className={`${TAP_TARGET} flex items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-alert/50 hover:text-alert`}
          >
            <Lock size={14} />
          </button>
        </div>

        <div role="tablist" aria-label={t('lock.title')} className="grid grid-cols-2 border-b border-line">
          {([['entries', t('vault.new')], ['integrity', t('vault.integrity')]] as const).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={`${TAP_TARGET} border-b-2 text-[13px] font-medium transition-colors ${
                tab === id ? 'border-sand text-sand' : 'border-transparent text-faint hover:text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'entries' ? (
          <>
            <div className="border-b border-line p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3.5 text-faint" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('vault.search')}
                  aria-label={t('vault.search')}
                  className={`${FIELD_BOXED} w-full pl-9 pr-3 text-sm text-cream focus:border-sand`}
                />
              </div>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
              <button
                type="button"
                onClick={newNote}
                className={`${TAP_TARGET} mb-2 w-full rounded-xl border border-dashed border-line text-sm text-muted transition-colors hover:border-sand/60 hover:bg-sand/5 hover:text-sand`}
              >
                <Plus size={14} className="mr-1.5 inline -mt-0.5" />
                {t('vault.new')}
              </button>

              {filteredNotes.length === 0 ? (
                <p className="px-2 py-10 text-sm leading-relaxed text-faint">
                  {notes.length === 0 ? t('vault.empty') : t('vault.emptyFiltered')}
                </p>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => void openNote(note)}
                    aria-current={activeNote?.id === note.id}
                    className={`${TAP_TARGET} w-full rounded-xl border p-3 text-left transition-colors ${
                      activeNote?.id === note.id
                        ? 'border-sand/60 bg-sand/10'
                        : 'border-line hover:border-muted/40 hover:bg-ink-raised'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-cream">{note.title}</span>
                      <span className="shrink-0 text-[10px] text-faint tabular-nums">
                        {note.updatedAt?.slice(0, 10)}
                      </span>
                    </div>
                    {note.preview && <p className="mt-1 truncate text-xs text-faint">{note.preview}</p>}
                    {note.tags && note.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span key={tag} className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-line p-3 text-xs text-faint">
              {notes.length} {t('vault.noteCount')}
            </div>
          </>
        ) : (
          <div className="min-h-0 flex-1" />
        )}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {savedAt && (
          <div
            role="status"
            className="absolute right-4 top-4 z-50 rounded-full border border-line bg-ink-raised px-4 py-2 text-xs text-sand"
          >
            {t('vault.saved')}
          </div>
        )}

        {tab === 'integrity' ? (
          <div role="tabpanel" id="panel-integrity" aria-labelledby="tab-integrity" className="min-h-0 flex-1">
            <IntegrityPanel />
          </div>
        ) : (
          <div role="tabpanel" id="panel-entries" aria-labelledby="tab-entries" className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-14 items-center justify-between gap-4 border-b border-line px-6">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder={t('vault.titlePlaceholder')}
                aria-label={t('vault.titlePlaceholder')}
                className={`${FIELD} min-w-0 flex-1 font-display text-lg text-cream`}
              />
              <div className="flex shrink-0 items-center gap-2">
                {activeNote && (
                  <>
                    <button
                      type="button"
                      onClick={() => copy(noteContent, activeNote.id)}
                      title={t('vault.copy')}
                      aria-label={t('vault.copy')}
                      className={`${TAP_TARGET} flex items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-sand/60 hover:text-sand`}
                    >
                      {copiedId === activeNote.id ? <Check size={16} className="text-sage" /> : <Copy size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(activeNote.id)}
                      title={t('vault.delete')}
                      aria-label={t('vault.delete')}
                      className={`${TAP_TARGET} flex items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-alert/60 hover:text-alert`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={busy}
                  className="btn btn-sand px-5 text-sm disabled:opacity-60"
                >
                  <Save size={14} />
                  {busy ? t('vault.saving') : t('vault.save')}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-line bg-ink-soft px-6 py-2">
              <span className="eyebrow shrink-0 text-faint">{t('vault.tagsLabel')}</span>
              <input
                type="text"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                placeholder={t('vault.tagsPlaceholder')}
                aria-label={t('vault.tagsLabel')}
                className={`${FIELD} min-w-0 flex-1 text-sm text-cream`}
              />
            </div>

            <div className="flex-1 p-6">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t('vault.bodyPlaceholder')}
                aria-label={t('vault.bodyPlaceholder')}
                spellCheck={false}
                className="h-full w-full resize-none border-0 bg-transparent font-mono text-sm leading-relaxed text-cream"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};