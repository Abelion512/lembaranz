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

    test('harus menetralkan encoded link jahat', async () => {
        const result = await safeMarked.parse('[klik](javascript%3Aalert("xss"))');
        expect(result).not.toContain('href="javascript');
        expect(result).toContain('<span>klik</span>');
    });

    test('harus menetralkan entity link jahat', async () => {
        const result = await safeMarked.parse('[klik](javascript&#58;alert("xss"))');
        expect(result).not.toContain('href="javascript');
        expect(result).toContain('<span>klik</span>');
    });

    test('harus menetralkan whitespace evasion', async () => {
        const result = await safeMarked.parse('[klik](java%0Ascript:alert("xss"))');
        expect(result).not.toContain('href="java');
        expect(result).toContain('<span>klik</span>');
    });
});
