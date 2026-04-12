import { marked } from 'marked';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, Github } from 'lucide-react';
import { bacaBerkas } from '@/lib/bacaBerkas';

export const metadata = {
    title: 'Kebijakan Privasi — Lembaran',
    description: 'Kebijakan privasi platform Lembaran.',
};

export default async function PrivacyPage() {
    const content = bacaBerkas('PRIVACY.md');
    const htmlContent = content ? await marked.parse(content) : '<p>Dokumen tidak ditemukan.</p>';

    return (
        <div className='flex-1 flex flex-col min-h-screen bg-[var(--background)] overflow-y-auto no-scrollbar'>
            {/* Header */}
            <header className='sticky top-0 z-30 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--separator)]/5'>
                <Link href='/' className='flex items-center gap-2 text-[var(--text-muted)] hover:text-blue-500 transition-colors'>
                    <ChevronLeft size={18} />
                    <span className='text-[12px] font-bold uppercase tracking-widest'>Beranda</span>
                </Link>
                <span className='text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]/40'>Kebijakan Privasi</span>
                <Link href='/bantuan' className='text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-blue-500 transition-colors'>
                    Bantuan
                </Link>
            </header>

            {/* Content */}
            <main className='max-w-3xl w-full mx-auto px-6 py-16'>
                <div className='prose dark:prose-invert prose-sm max-w-none
                    prose-headings:font-light prose-headings:tracking-tight
                    prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
                    prose-li:text-[var(--text-secondary)]
                    prose-code:text-blue-500 prose-code:bg-blue-500/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                    prose-strong:text-[var(--text-primary)]'>
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
            </main>

            {/* Footer */}
            <footer className='px-6 py-8 border-t border-[var(--separator)]/5 mt-auto'>
                <div className='max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]/50'>
                    <span>© {new Date().getFullYear()} Lembaran</span>
                    <div className='flex items-center gap-8'>
                        <Link href='/ketentuan' className='hover:text-blue-500 transition-colors'>Ketentuan</Link>
                        <Link href='/bantuan' className='hover:text-blue-500 transition-colors'>Bantuan</Link>
                        <a href='https://github.com/Abelion512/lembaran' target='_blank' rel='noopener noreferrer' className='hover:text-blue-500 transition-colors flex items-center gap-1'>
                            <Github size={12} /> GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
