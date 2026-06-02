import { Vault } from "../Vault";

/**
 * Legacy implementation for performance comparison
 */
function legacyHexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function legacyBase64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  return Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
}

async function runComparison() {
  console.log("=== Lembaranz Performance Benchmark (ATA Level 7) ===");
  console.log("Comparing Legacy (Substrings/parseInt) vs Modern (Bitwise/Loop)\n");

  const iterations = 100_000;
  const hexInput = "4c656d626172616e7a2053656375726974792041756469742032303236"; // "Lembaranz Security Audit 2026" in hex
  const base64Input = btoa("Lembaranz Security Audit 2026");

  // 1. Hex Conversion
  console.log(`[HEX] Converting ${hexInput.length} chars (${iterations.toLocaleString()} iterations)`);
  
  const startLegacyHex = performance.now();
  for (let i = 0; i < iterations; i++) {
    legacyHexToBytes(hexInput);
  }
  const endLegacyHex = performance.now();
  
  const startModernHex = performance.now();
  for (let i = 0; i < iterations; i++) {
    Vault.hexToBytes(hexInput);
  }
  const endModernHex = performance.now();

  const legacyHexTime = endLegacyHex - startLegacyHex;
  const modernHexTime = endModernHex - startModernHex;
  const hexImprovement = (legacyHexTime / modernHexTime).toFixed(2);

  console.log(`  Legacy: ${legacyHexTime.toFixed(2)}ms`);
  console.log(`  Modern: ${modernHexTime.toFixed(2)}ms`);
  console.log(`  Result: ${hexImprovement}x Faster\n`);

  // 2. Base64 Conversion
  console.log(`[B64] Converting ${base64Input.length} chars (${iterations.toLocaleString()} iterations)`);

  const startLegacyB64 = performance.now();
  for (let i = 0; i < iterations; i++) {
    legacyBase64ToBytes(base64Input);
  }
  const endLegacyB64 = performance.now();

  const startModernB64 = performance.now();
  for (let i = 0; i < iterations; i++) {
    Vault.base64ToBytes(base64Input);
  }
  const endModernB64 = performance.now();

  const legacyB64Time = endLegacyB64 - startLegacyB64;
  const modernB64Time = endModernB64 - startModernB64;
  const b64Improvement = (legacyB64Time / modernB64Time).toFixed(2);

  console.log(`  Legacy: ${legacyB64Time.toFixed(2)}ms`);
  console.log(`  Modern: ${modernB64Time.toFixed(2)}ms`);
  console.log(`  Result: ${b64Improvement}x Faster\n`);

  console.log("=====================================================");
}

runComparison().catch(console.error);
