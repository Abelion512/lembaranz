/**
 * Calendar.ts
 * Utilities for processing poetic and smart dates.
 */

export const parseSmartDate = (text: string): Date | null => {
    const today = new Date();
    const cleanText = text.toLowerCase().trim();

    if (cleanText === '@hari_ini' || cleanText === '@sekarang') {
        return today;
    }

    if (cleanText === '@besok') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow;
    }

    if (cleanText === '@kemarin') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return yesterday;
    }

    if (cleanText === '@lusa') {
        const afterTomorrow = new Date(today);
        afterTomorrow.setDate(today.getDate() + 2);
        return afterTomorrow;
    }

    if (cleanText === '@minggu_depan') {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return nextWeek;
    }

    // Hari dalam seminggu
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    for (let i = 0; i < days.length; i++) {
        if (cleanText === `@${days[i]}`) {
            const resultDate = new Date(today);
            let diff = i - today.getDay();
            if (diff <= 0) diff += 7; // Ambil hari tersebut di minggu depan
            resultDate.setDate(today.getDate() + diff);
            return resultDate;
        }
    }

    return null;
};

export const formatArchiveDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
