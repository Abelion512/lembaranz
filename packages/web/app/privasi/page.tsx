import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

async function getContent() {
    const filePath = path.join(process.cwd(), 'PRIVACY.md');
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return marked(fileContent);
    } catch (e) {
        return '<p>Dokumen tidak ditemukan.</p>';
    }
}

export default async function PrivacyPage() {
    const htmlContent = await getContent();

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
