import { marked } from 'marked';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { bacaBerkas } from '@/lib/bacaBerkas';

export default async function PrivacyPage() {
    const content = bacaBerkas('PRIVACY.md');
    const htmlContent = content ? await marked.parse(content) : '<p>Dokumen tidak ditemukan.</p>';

    return (
        <div className='flex-1 flex flex-col min-h-0 bg-[var(--background)] px-5 pt-14 pb-20 overflow-y-auto no-scrollbar'>
            <Link href='/tentang' className='flex items-center gap-1 text-[var(--primary)] mb-6 active:opacity-40 w-fit'>
                <ChevronLeft size={24} />
                <span className='text-[17px]'>Tentang</span>
            </Link>
            <div className='prose dark:prose-invert prose-sm max-w-none'>
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </div>
    );
}
