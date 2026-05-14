import { Link } from '@/i18n/navigation';
import { ChevronLeft, Github } from 'lucide-react';
import { readFile } from '@/lib/readFile';
import { safeMarked } from '@/lib/safeMarked';

export const metadata = {
    title: 'Ketentuan Layanan — Lembaran',
    description: 'Ketentuan layanan platform Lembaran.',
};

export default async function TermsPage() {
    const content = readFile('TERMS.md');
    const htmlContent = content ? await safeMarked.parse(content) : '<p>Dokumen tidak ditemukan.</p>';

    return (
        <div className='flex-1 flex flex-col min-h-screen bg-(--background) overflow-y-auto no-scrollbar'>
            {/* Header */}
            <header className='sticky top-0 z-30 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-(--background)/80 border-b border-(--separator)/5'>
                <Link href='/' className='flex items-center gap-2 text-(--text-muted) hover:text-blue-500 transition-colors'>
                    <ChevronLeft size={18} />
                    <span className='text-[12px] font-bold uppercase tracking-widest'>Beranda</span>
                </Link>
                <span className='text-[10px] font-black uppercase tracking-[0.3em] text-(--text-muted)/40'>Ketentuan Layanan</span>
                <Link href='/docs' className='text-[10px] font-bold uppercase tracking-widest text-(--text-muted) hover:text-blue-500 transition-colors'>
                    Bantuan
                </Link>
            </header>

            {/* Content */}
            <main className='max-w-3xl w-full mx-auto px-6 py-16'>
                <div className='prose dark:prose-invert prose-sm max-w-none
                    prose-headings:font-light prose-headings:tracking-tight
                    prose-p:text-(--text-secondary) prose-p:leading-relaxed
                    prose-li:text-(--text-secondary)
                    prose-code:text-blue-500 prose-code:bg-blue-500/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                    prose-strong:text-(--text-primary)'>
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
            </main>

            {/* Footer */}
            <footer className='px-6 py-8 border-t border-(--separator)/5 mt-auto'>
                <div className='max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-(--text-muted)/50'>
                    <span>© {new Date().getFullYear()} Lembaran</span>
                    <div className='flex items-center gap-8'>
                        <Link href='/privacy' className='hover:text-blue-500 transition-colors'>Privasi</Link>
                        <Link href='/docs' className='hover:text-blue-500 transition-colors'>Bantuan</Link>
                        <a href='https://github.com/Abelion512/lembaran' target='_blank' rel='noopener noreferrer' className='hover:text-blue-500 transition-colors flex items-center gap-1'>
                            <Github size={12} /> GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
