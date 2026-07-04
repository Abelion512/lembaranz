import { test, expect, describe } from 'bun:test';
import { safeMarked } from '../safeMarked';

describe('safeMarked Rendering', () => {
    test('harus memblokir raw HTML', async () => {
        const result = await safeMarked.parse('<script>alert("xss")</script>');
        expect(result).not.toContain('<script>');
    });

    test('harus menetralkan link jahat', async () => {
        const result = await safeMarked.parse('[klik](javascript:alert("xss"))');
        expect(result).not.toContain('href="javascript:');
        expect(result).toContain('<span>klik</span>');
    });

    test('harus menetralkan gambar jahat', async () => {
        const result = await safeMarked.parse('![gambar](javascript:alert("xss"))');
        expect(result).not.toContain('src="javascript:');
        expect(result).toContain('<span>gambar</span>');
    });

    test('harus escape attribute di link', async () => {
        const result = await safeMarked.parse('[klik](https://x.com"onmouseover="alert(1)"))');
        expect(result).toContain('&quot;onmouseover=&quot;alert(1)&quot;');
        expect(result).not.toContain('"onmouseover');
    });

    test('harus escape attribute di gambar', async () => {
        const result = await safeMarked.parse('![x"onerror="alert(1)](https://x.com)');
        expect(result).toContain('alt="x&quot;onerror=&quot;alert(1)"');
        expect(result).not.toContain('"onerror='); // The test should check that it doesn't contain the raw, unescaped quote + "onerror="
    });

    test('harus menetralkan link jahat yang dienkode entity html', async () => {
        const result = await safeMarked.parse('[klik](javascript&#58;alert(1))');
        expect(result).not.toContain('javascript');
        expect(result).toContain('<span>klik</span>');
    });

    test('harus menetralkan link jahat yang mengandung whitespace awal/akhir', async () => {
        const result3 = await safeMarked.parse('[klik]( javascript:alert(1))');
        expect(result3).not.toContain(' javascript');
        expect(result3).toContain('<span>klik</span>');
    });

    test('harus menetralkan link jahat yang dienkode URL', async () => {
        const result = await safeMarked.parse('[klik](%6A%61%76%61%73%63%72%69%70%74%3Aalert(1))');
        expect(result).not.toContain('%6A');
        expect(result).toContain('<span>klik</span>');
    });

    test('harus menetralkan link jahat yang dienkode URL ganda (double-encoded)', async () => {
        const result = await safeMarked.parse('[klik](%256A%2561%2576%2561%2573%2563%2572%2569%2570%2574%253Aalert(1))');
        expect(result).not.toContain('%256A');
        expect(result).toContain('<span>klik</span>');
    });

    test('harus menetralkan link jahat yang memiliki invalid URL encoding (bypass)', async () => {
        const result = await safeMarked.parse('[klik](%6A%61%76%61%73%63%72%69%70%74%3Aalert(1)%FF)');
        expect(result).not.toContain('alert(1)');
        expect(result).toContain('<span>klik</span>');
    });
});
