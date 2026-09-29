import { performance } from "perf_hooks";

function base64ToBytes_buffer(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

function base64ToBytes_old(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const CHUNK_SIZE = 8192;
const data = new Uint8Array(1000000); // 1mb
crypto.getRandomValues(data);
let b64 = "";
for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    b64 += String.fromCharCode(...data.subarray(i, i + CHUNK_SIZE));
}
b64 = btoa(b64);


const start1 = performance.now();
base64ToBytes_old(b64);
const end1 = performance.now();

const start2 = performance.now();
base64ToBytes_buffer(b64);
const end2 = performance.now();

console.log(`Old: ${end1 - start1}ms`);
console.log(`Buffer: ${end2 - start2}ms`);
