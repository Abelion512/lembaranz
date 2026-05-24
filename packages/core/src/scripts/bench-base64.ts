function bytesToBase64Old(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

function bytesToBase64New(bytes: Uint8Array): string {
    let binaryString = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binaryString += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as unknown as number[]);
    }
    return btoa(binaryString);
}

function base64ToBytesOld(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

function base64ToBytesNew(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

const data = new Uint8Array(1024 * 1024); // 1MB - old will crash here due to max call stack!
// so let's benchmark 10KB
const smallData = new Uint8Array(10 * 1024);
for(let i=0; i<smallData.length; i++) smallData[i] = Math.floor(Math.random() * 256);
const b64 = bytesToBase64New(smallData);

const ITERATIONS = 1000;

console.time("Old Encode (10KB)");
for (let i = 0; i < ITERATIONS; i++) bytesToBase64Old(smallData);
console.timeEnd("Old Encode (10KB)");

console.time("New Encode (10KB)");
for (let i = 0; i < ITERATIONS; i++) bytesToBase64New(smallData);
console.timeEnd("New Encode (10KB)");

console.time("Old Decode (10KB)");
for (let i = 0; i < ITERATIONS; i++) base64ToBytesOld(b64);
console.timeEnd("Old Decode (10KB)");

console.time("New Decode (10KB)");
for (let i = 0; i < ITERATIONS; i++) base64ToBytesNew(b64);
console.timeEnd("New Decode (10KB)");
