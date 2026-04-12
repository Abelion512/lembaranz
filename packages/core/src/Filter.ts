export const stripHtml = (html: string): string => {
    if (!html) return '';
    // Use a simple regex for universal support (SSR safe)
    return html.replace(/<[^>]*>?/gm, '');
};

export const truncate = (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
};
