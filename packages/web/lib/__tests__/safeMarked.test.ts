import { test, expect, describe } from "bun:test";
import { safeMarked } from "../safeMarked";

describe("safeMarked Rendering", () => {
  test("harus memblokir raw HTML", async () => {
    const result = await safeMarked.parse('<script>alert("xss")</script>');
    expect(result).not.toContain("<script>");
  });

  test("harus menetralkan link jahat", async () => {
    const result = await safeMarked.parse('[klik](javascript:alert("xss"))');
    expect(result).not.toContain('href="javascript:');
    expect(result).toContain("<span>klik</span>");
  });

  test("harus menetralkan link jahat (evasion vectors)", async () => {
    const bypasses = [
      "[klik](javascript%3Aalert(1))",
      "[klik](javascript&colon;alert(1))",
      "[klik](javasc&#114;ipt:alert(1))",
      "[klik](jav\tascript:alert(1))",
      "[klik]( javascript:alert(1))",
      "[klik](%20javascript:alert(1))",
      "[klik](&#x6A;avascript:alert(1))",
    ];

    for (const payload of bypasses) {
      const result = await safeMarked.parse(payload);
      expect(result).not.toContain('href="javascript');
      const isSafe =
        result.includes("<span>klik</span>") || !result.includes("<a ");
      expect(isSafe).toBe(true);
    }
  });

  test("harus menetralkan gambar jahat", async () => {
    const result = await safeMarked.parse('![gambar](javascript:alert("xss"))');
    expect(result).not.toContain('src="javascript:');
    expect(result).toContain("<span>gambar</span>");
  });

  test("harus escape attribute di link", async () => {
    const result = await safeMarked.parse(
      '[klik](https://x.com"onmouseover="alert(1)"))'
    );
    expect(result).toContain("&quot;onmouseover=&quot;alert(1)&quot;");
    expect(result).not.toContain('"onmouseover');
  });

  test("harus escape attribute di gambar", async () => {
    const result = await safeMarked.parse(
      '![x"onerror="alert(1)"](https://x.com)'
    );
    expect(result).toContain('alt="x&quot;onerror=&quot;alert(1)&quot;"');
    expect(result).not.toContain('"onerror=');
  });

  test("harus menetralkan link jahat dengan whitespace evasion", async () => {
    const result = await safeMarked.parse('[klik](javascript%09:alert("xss"))');
    expect(result).not.toContain('href="javascript');
    expect(result).toContain("<span>klik</span>");
  });

  test("harus menetralkan link jahat dengan HTML entities tanpa semicolon", async () => {
    const result = await safeMarked.parse('[klik](javascript&#58alert("xss"))');
    expect(result).not.toContain('href="javascript');
    expect(result).toContain("<span>klik</span>");
  });

  test("harus menetralkan gambar jahat dengan karakter tidak valid setelah persen", async () => {
    const result = await safeMarked.parse(
      '![gambar](javascript%3Aalert("xss")%XX)'
    );
    expect(result).not.toContain('src="javascript');
    expect(result).toContain("<span>gambar</span>");
  });
});

describe("safeMarked - XSS Prevention Filter Bypasses", () => {
  test("should block javascript: links with spaces", async () => {
    const html = await safeMarked.parse("[XSS]( javascript:alert(1) )");
    expect(html).toContain("<span>XSS</span>");
    expect(html).not.toContain("href");
  });

  test("should block URL encoded javascript: links", async () => {
    const html = await safeMarked.parse("[XSS](javascript%3Aalert(1))");
    expect(html).toContain("<span>XSS</span>");
    expect(html).not.toContain("href");
  });

  test("should block HTML entity encoded javascript: links", async () => {
    const html = await safeMarked.parse("[XSS](javascript&#58;alert(1))");
    expect(html).toContain("<span>XSS</span>");
    expect(html).not.toContain("href");

    const html2 = await safeMarked.parse("[XSS](&#x6A;avascript:alert(1))");
    expect(html2).toContain("<span>XSS</span>");
    expect(html2).not.toContain("href");
  });

  test("should block javascript: links with control characters", async () => {
    const html = await safeMarked.parse("[XSS](\x0Bjavascript:alert(1))");
    expect(html).toContain("<span>XSS</span>");
    expect(html).not.toContain("href");
  });
});
