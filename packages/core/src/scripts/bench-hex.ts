import { Vault } from "../Vault";

function oldHexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function newHexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const c1 = hex.charCodeAt(i * 2);
    const c2 = hex.charCodeAt(i * 2 + 1);

    // Magic number explanation:
    // Numbers '0'-'9' (48-57) >> 6 = 0. Result is simply c & 0xf.
    // Letters 'A'-'F' (65-70) and 'a'-'f' (97-102) >> 6 = 1. Result adds 9 to c & 0xf.
    const n1 = (c1 & 0xf) + (c1 >> 6) * 9;
    const n2 = (c2 & 0xf) + (c2 >> 6) * 9;

    bytes[i] = (n1 << 4) | n2;
  }
  return bytes;
}

const hexString = "4c4d42520102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20abcdefABCDEF1234567890".repeat(100);

let start = performance.now();
for(let i=0; i<10000; i++) {
  oldHexToBytes(hexString);
}
let timeOld = performance.now() - start;

start = performance.now();
for(let i=0; i<10000; i++) {
  newHexToBytes(hexString);
}
let timeNew = performance.now() - start;

console.log("Old (parseInt):", timeOld.toFixed(2), "ms");
console.log("New (bitwise):", timeNew.toFixed(2), "ms");
console.log("Speedup:", (timeOld / timeNew).toFixed(2), "x");

const testHex = "0123456789abcdefABCDEF";
const r1 = oldHexToBytes(testHex);
const r2 = newHexToBytes(testHex);
let match = r1.length === r2.length && r1.every((v, i) => v === r2[i]);
console.log("Results match:", match);
