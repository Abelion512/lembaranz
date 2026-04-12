import React from 'react';
import { HelpSidebar } from '@/components/shared/HelpSidebar';

export default function DocLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full min-h-screen bg-(--background)">
            <HelpSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    );
}
