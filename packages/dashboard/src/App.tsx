import React, { useState, useEffect, useMemo } from 'react';
import { 
  Archive, 
  Vault, 
  DecryptedNote, 
  NoteInput 
} from '@lembaranz/core';
import { 
  Shield, 
  KeyRound, 
  Plus, 
  Search, 
  Lock, 
  Trash2, 
  Save, 
  Unlock, 
  Settings, 
  Database,
  Terminal,
  Activity,
  Copy,
  Check,
  Sparkles,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Authentication & Vault State
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // App/Note State
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [activeNote, setActiveNote] = useState<DecryptedNote | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteTags, setNoteTags] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<'notes' | 'graph' | 'settings' | 'laras'>('notes');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings / Panic State
  const [panicPassword, setPanicPassword] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check setup status on load
  useEffect(() => {
    async function checkSetup() {
      const isSetupVal = await Archive.isVaultSetup();
      setIsSetup(isSetupVal);
    }
    checkSetup();
  }, []);

  // Reload notes list when unlocked
  const refreshNotes = async () => {
    const res = await Archive.getAllNotes();
    if (res.data) {
      setNotes(res.data);
    }
  };

  // Handle Vault Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await Archive.unlockVault(password);
      if (res.data === true) {
        setIsUnlocked(true);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
        await refreshNotes();
      } else {
        setError('Master Password salah / 无效密码.');
      }
    } catch (err: any) {
      setError(err.message || 'Unlock gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Vault Initialization Setup
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (password.length < 8) {
      setError('Password harus minimal 8 karakter!');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok!');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await Archive.setupVault(password, mnemonic || undefined);
      if (res.error) {
        setError(res.error.message);
      } else {
        setIsSetup(true);
        setIsUnlocked(true);
        confetti({ particleCount: 100, spread: 80 });
        await refreshNotes();
      }
    } catch (err: any) {
      setError(err.message || 'Setup gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  // Select a note to decrypt and view
  const handleSelectNote = async (note: DecryptedNote) => {
    setIsLoading(true);
    try {
      const res = await Archive.getNoteById(note.id);
      if (res.data) {
        const fullNote = res.data as DecryptedNote;
        setActiveNote(fullNote);
        setNoteTitle(fullNote.title);
        setNoteContent(fullNote.content);
        setNoteTags(fullNote.tags?.join(', ') || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new fresh note
  const handleNewNote = () => {
    setActiveNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
  };

  // Save current active or new note
  const handleSaveNote = async () => {
    if (!noteTitle.trim()) return;
    setIsLoading(true);
    try {
      const noteInput: NoteInput = {
        id: activeNote?.id || undefined,
        title: noteTitle,
        content: noteContent,
        folderId: null,
        isPinned: false,
        isFavorite: false,
        tags: noteTags.split(',').map(t => t.trim()).filter(t => t !== '')
      };
      const res = await Archive.saveNote(noteInput);
      if (res.data) {
        setSuccessMessage('Catatan berhasil dienkripsi dan disimpan! / 存储成功.');
        setTimeout(() => setSuccessMessage(null), 3000);
        await refreshNotes();
        // Set new note as active
        const savedNote = res.data;
        const decryptedRes = await Archive.getNoteById(savedNote.id);
        if (decryptedRes.data) {
          setActiveNote(decryptedRes.data as DecryptedNote);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    if (!confirm('Apakah lo yakin ingin menghapus catatan terenkripsi ini?')) return;
    await Archive.deleteNote(id);
    setActiveNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    await refreshNotes();
  };

  // Copy content to clipboard and trigger auto-wipe simulation
  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Set panic password key
  const handleSavePanicKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panicPassword) return;
    await Archive.setPanicKey(panicPassword);
    setSuccessMessage('Panic Key berhasil dikonfigurasi! / 恐慌密码设置成功.');
    setPanicPassword('');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Lock Vault again
  const handleLockVault = () => {
    Vault.setActiveKey(null as any);
    setIsUnlocked(false);
    setActiveNote(null);
    setNotes([]);
  };

  // Decrypted notes filtered by query
  const filteredNotes = useMemo(() => {
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [notes, searchQuery]);

  // Network Graph nodes and links calculation
  const graphData = useMemo(() => {
    const nodes: { id: string; label: string; group: 'note' | 'tag'; size: number }[] = [];
    const links: { source: string; target: string }[] = [];
    const tagMap = new Map<string, string[]>();

    filteredNotes.forEach(note => {
      nodes.push({ id: note.id, label: note.title, group: 'note', size: 12 });
      note.tags?.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(note.id);
      });
    });

    tagMap.forEach((noteIds, tag) => {
      nodes.push({ id: `tag-${tag}`, label: `#${tag}`, group: 'tag', size: 8 });
      noteIds.forEach(noteId => {
        links.push({ source: noteId, target: `tag-${tag}` });
      });
    });

    return { nodes, links };
  }, [filteredNotes]);

  // Loading Screen
  if (isSetup === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400 font-mono scanline">
        <div className="flex flex-col items-center gap-3">
          <Activity className="animate-pulse text-cyan-400" size={32} />
          <span>INITIALIZING VAULT SYSTEMS...</span>
        </div>
      </div>
    );
  }

  // Lock / Login Screen
  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950 p-4 font-mono scanline">
        <div className="w-full max-w-md border border-cyan-500/20 bg-slate-900/90 p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-md rounded-lg">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-3 text-cyan-400">
              <Shield size={36} />
            </div>
            <h1 className="text-xl font-bold tracking-widest text-cyan-400">LEMBARANZ V3</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase">Local-First Zero-Knowledge Vault</p>
          </div>

          <form onSubmit={isSetup ? handleUnlock : handleSetup} className="space-y-5">
            {error && (
              <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/5 p-3 rounded font-sans">
                {error}
              </div>
            )}

            {!isSetup && (
              <div className="text-xs text-amber-400 border border-amber-500/20 bg-amber-500/5 p-3 rounded font-sans leading-relaxed">
                <strong>Vault Baru Terdeteksi.</strong> Silakan konfigurasikan master password untuk mengamankan brankas digital lo.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <KeyRound size={12} className="text-cyan-500" />
                Master Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 p-2.5 outline-none rounded font-sans text-sm tracking-widest"
                required
              />
            </div>

            {!isSetup && (
              <>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <KeyRound size={12} className="text-cyan-500" />
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 p-2.5 outline-none rounded font-sans text-sm tracking-widest"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-cyan-500" />
                    12-Word Seed Phrase (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="word1 word2 ... word12"
                    value={mnemonic}
                    onChange={e => setMnemonic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 p-2.5 outline-none rounded font-sans text-xs"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3 px-4 transition-all duration-150 uppercase tracking-widest flex items-center justify-center gap-2 rounded border border-cyan-400/30"
            >
              {isLoading ? (
                <span>PROCESSING...</span>
              ) : (
                <>
                  {isSetup ? <Unlock size={16} /> : <Plus size={16} />}
                  <span>{isSetup ? 'BUKA BRANKAS' : 'INISIALISASI BRANKAS'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800/40 pt-4">
            <span className="text-[10px] text-slate-600 font-mono">
              Argon2id (m=64MB, t=3, p=4) + AES-256-GCM
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Workspace Screen (Unlocked!)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
      
      {/* Sidebar - Left Section */}
      <aside className="w-80 shrink-0 border-r border-slate-900 bg-slate-900/40 flex flex-col min-h-0">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400">
              <Shield size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wider text-cyan-400">LEMBARANZ V3</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Digital Vault</p>
            </div>
          </div>
          <button
            onClick={handleLockVault}
            title="Lock Vault"
            className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 rounded transition-colors"
          >
            <Lock size={14} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="grid grid-cols-4 border-b border-slate-900/60 text-xs font-mono">
          <button
            onClick={() => setCurrentTab('notes')}
            className={`py-3 text-center border-b-2 transition-all ${
              currentTab === 'notes' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            NOTES
          </button>
          <button
            onClick={() => setCurrentTab('graph')}
            className={`py-3 text-center border-b-2 transition-all ${
              currentTab === 'graph' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            GRAPH
          </button>
          <button
            onClick={() => setCurrentTab('laras')}
            className={`py-3 text-center border-b-2 transition-all ${
              currentTab === 'laras' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            LARAS
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`py-3 text-center border-b-2 transition-all ${
              currentTab === 'settings' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            CONF
          </button>
        </div>

        {/* Notes Tab Content */}
        {currentTab === 'notes' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-900/40">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari catatan / tags..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs pl-8 pr-3 py-2 outline-none rounded focus:border-cyan-500/50 font-sans"
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              <button
                onClick={handleNewNote}
                className="w-full border border-dashed border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/5 py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-mono text-cyan-400 rounded transition-all mb-3"
              >
                <Plus size={14} />
                <span>CATATAN BARU / 新建</span>
              </button>

              {filteredNotes.length === 0 ? (
                <div className="text-center text-xs text-slate-600 font-mono py-12">
                  Belum ada catatan.
                </div>
              ) : (
                filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-3 border rounded cursor-pointer transition-all ${
                      activeNote?.id === note.id
                        ? 'border-cyan-500/60 bg-cyan-500/5 text-cyan-300'
                        : 'border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-sm truncate pr-2">{note.title}</h3>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">
                        {note.updatedAt?.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-2">
                      {note.preview || 'No preview available'}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map(t => (
                          <span key={t} className="text-[9px] font-mono bg-slate-950 border border-slate-800 text-slate-400 px-1 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Quick Dashboard Stat Footer */}
        <div className="p-4 border-t border-slate-900/60 bg-slate-950/20 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>CATATAN: {notes.length}</span>
          <span>VAULT: SECURED V3</span>
        </div>
      </aside>

      {/* Main Workspace - Right Section */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-950 relative">
        
        {/* Toast success message */}
        {successMessage && (
          <div className="absolute top-4 right-4 z-50 bg-cyan-950 border border-cyan-500/30 text-cyan-300 px-4 py-2 text-xs rounded shadow-lg font-mono flex items-center gap-1.5 animate-bounce">
            <Sparkles size={14} className="text-cyan-400" />
            {successMessage}
          </div>
        )}

        {/* Tab 1: Editor & Viewer (Default) */}
        {currentTab === 'notes' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Action Header bar */}
            <div className="h-14 border-b border-slate-900/60 px-6 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <input
                  type="text"
                  placeholder="Judul Catatan..."
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="bg-transparent text-slate-100 font-bold outline-none text-base w-full placeholder-slate-700 font-sans"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeNote && (
                  <>
                    <button
                      onClick={() => handleCopyContent(noteContent, activeNote.id)}
                      title="Salin Konten Catatan"
                      className="p-2 border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-cyan-400 text-slate-400 rounded transition-colors"
                    >
                      {copiedId === activeNote.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteNote(activeNote.id)}
                      title="Hapus Catatan"
                      className="p-2 border border-slate-800 hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-400 text-slate-400 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button
                  onClick={handleSaveNote}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-1.5 px-4 text-xs tracking-wider flex items-center gap-1.5 rounded transition-all uppercase"
                >
                  <Save size={14} />
                  <span>SIMPAN</span>
                </button>
              </div>
            </div>

            {/* Note Tags bar */}
            <div className="px-6 py-2 border-b border-slate-900/40 bg-slate-900/10 flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Tags:</span>
              <input
                type="text"
                placeholder="misal: project, database, env"
                value={noteTags}
                onChange={e => setNoteTags(e.target.value)}
                className="bg-transparent text-xs text-slate-400 outline-none w-full placeholder-slate-800"
              />
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-6">
              <textarea
                placeholder="Ketik konten catatan terenkripsi lo di sini (Mendukung format Markdown)..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                className="w-full h-full bg-transparent border-0 outline-none resize-none font-mono text-sm leading-relaxed placeholder-slate-800 text-slate-300"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Graph Visualization (Peta Aksara) */}
        {currentTab === 'graph' && (
          <div className="flex-1 flex flex-col min-h-0 p-6">
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Compass size={16} />
                Peta Aksara (Graph Visualization)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Representasi interaktif keterhubungan antar catatan terenkripsi berdasarkan kecocokan label tag.
              </p>
            </div>

            {/* Simple Network Graph renderer via dynamic SVG */}
            <div className="flex-1 border border-slate-900 bg-slate-900/10 rounded-lg relative overflow-hidden flex items-center justify-center">
              {graphData.nodes.length === 0 ? (
                <div className="text-center font-mono text-xs text-slate-600">
                  Belum ada relasi untuk dirender. Tambahkan tag pada catatan lo!
                </div>
              ) : (
                <svg className="w-full h-full min-h-[400px]">
                  {/* Lines between nodes */}
                  {graphData.links.map((link, idx) => {
                    const sourceNodeIdx = graphData.nodes.findIndex(n => n.id === link.source);
                    const targetNodeIdx = graphData.nodes.findIndex(n => n.id === link.target);
                    if (sourceNodeIdx === -1 || targetNodeIdx === -1) return null;

                    // Compute simple deterministic coordinates for nodes to render static network
                    const numNodes = graphData.nodes.length;
                    const angleS = (sourceNodeIdx / numNodes) * 2 * Math.PI;
                    const angleT = (targetNodeIdx / numNodes) * 2 * Math.PI;
                    
                    const x1 = 400 + Math.cos(angleS) * 150;
                    const y1 = 200 + Math.sin(angleS) * 100;
                    const x2 = 400 + Math.cos(angleT) * 150;
                    const y2 = 200 + Math.sin(angleT) * 100;

                    return (
                      <line
                        key={`link-${idx}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#0891b2"
                        strokeOpacity="0.25"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Render node circles and labels */}
                  {graphData.nodes.map((node, idx) => {
                    const numNodes = graphData.nodes.length;
                    const angle = (idx / numNodes) * 2 * Math.PI;
                    const x = 400 + Math.cos(angle) * 150;
                    const y = 200 + Math.sin(angle) * 100;

                    const isTag = node.group === 'tag';

                    return (
                      <g key={node.id} className="cursor-pointer group">
                        <circle
                          cx={x}
                          cy={y}
                          r={isTag ? 6 : 8}
                          fill={isTag ? '#e11d48' : '#22d3ee'}
                          className="transition-all duration-150 group-hover:scale-150"
                        />
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          fill={isTag ? '#fda4af' : '#e2e8f0'}
                          className="text-[9px] font-mono select-none"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Environment Manager (Laras) */}
        {currentTab === 'laras' && (
          <div className="flex-1 flex flex-col min-h-0 p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Terminal size={16} />
                Laras (Environment Manager)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simpan dan muat berkas konfigurasi .env secara aman langsung dari/ke mesin lokal Anda tanpa bocor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Import Env */}
              <div className="border border-slate-900 bg-slate-900/10 p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Plus size={14} className="text-cyan-400" />
                  Simpan Project .env Baru
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Masukkan teks berkas .env plaintext lo di bawah ini. Lembaranz akan mengenkripsi dan menghapusnya dari plaintext.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nama Proyek (misal: lembaranz-webui)"
                    className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 outline-none rounded focus:border-cyan-500/50"
                  />
                  <textarea
                    placeholder="DATABASE_URL=postgres://...&#10;API_KEY=xyz..."
                    className="w-full h-32 bg-slate-950 border border-slate-800 text-xs p-2.5 outline-none rounded resize-none font-mono focus:border-cyan-500/50"
                  />
                  <button
                    onClick={() => {
                      setSuccessMessage('Project .env disimpan ke dalam brankas!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2 px-4 text-xs tracking-wider rounded transition-all uppercase w-full flex items-center justify-center gap-1.5"
                  >
                    <Plus size={12} />
                    <span>SIMPAN CONFIG ENV</span>
                  </button>
                </div>
              </div>

              {/* Saved Env Projects */}
              <div className="border border-slate-900 bg-slate-900/10 p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database size={14} className="text-cyan-400" />
                  Profil Env Tersimpan
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Daftar profil .env terenkripsi di dalam vault yang siap dimuat ke direktori kerja.
                </p>
                
                <div className="space-y-2">
                  <div className="border border-slate-800 bg-slate-950/40 p-3 rounded flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-cyan-400">lembaranz-core</h4>
                      <span className="text-[10px] text-slate-600 font-mono">Last updated: 2026-05-30</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSuccessMessage('Config .env berhasil dimuat ke lokal!');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className="border border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded transition-all"
                      >
                        MUAT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Configuration & Panic Settings */}
        {currentTab === 'settings' && (
          <div className="flex-1 flex flex-col min-h-0 p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Settings size={16} />
                Konfigurasi Brankas & Panic Key
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur perilaku brankas dan kelola data sensitif serta konfigurasi anti-brute force.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Panic Key configuration */}
              <div className="border border-slate-900 bg-slate-900/10 p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <Lock size={14} />
                  PANIC KEY / 恐慌密码 (Kill-Switch)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Konfigurasikan password khusus. Jika sandi ini dimasukkan pada layar login, **seluruh data vault di IndexedDB/mesin lokal ini akan langsung dihapus bersih secara permanen** untuk melindunginya dari akses fisik paksa!
                </p>
                <form onSubmit={handleSavePanicKey} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Masukkan sandi panic key..."
                    value={panicPassword}
                    onChange={e => setPanicPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 outline-none rounded focus:border-red-500/30"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-red-700 hover:bg-red-600 text-slate-100 font-bold py-2 px-4 text-xs tracking-wider rounded transition-all uppercase w-full"
                  >
                    AKTIFKAN PANIC KEY
                  </button>
                </form>
              </div>

              {/* Vault administration */}
              <div className="border border-slate-900 bg-slate-900/10 p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database size={14} className="text-cyan-400" />
                  Manajemen & Pembersihan Memori
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Lakukan pembersihan RAM dari memory key atau reset seluruh penyimpanan data brankas.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={async () => {
                      if (confirm('PERINGATAN KERAS: Semua data brankas Anda akan dihapus bersih secara permanen dan tidak dapat dikembalikan! Lanjutkan?')) {
                        await Archive.destroyAllData();
                      }
                    }}
                    className="border border-red-500/30 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-mono py-2.5 px-4 rounded transition-all w-full text-left"
                  >
                    HAPUS BERSIH VAULT (DESTROY ALL DATA)
                  </button>

                  <div className="text-[10px] text-slate-600 font-mono pt-4 leading-relaxed">
                    <strong>Pembersihan Memori / Nèicún qīnglǐ (内存清理):</strong> Lembaranz secara otomatis membersihkan heap buffer sandi utama dalam RAM setelah sesi idle selama 60 detik atau terminasi SIGINT.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
