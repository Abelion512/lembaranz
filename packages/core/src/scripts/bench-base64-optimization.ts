

const size = 1024 * 1024 * 5; // 5MB
const bytes = new Uint8Array(size);

console.time("btoa ...new Uint8Array");
try {
  btoa(String.fromCharCode(...bytes));
} catch (e) {
  console.log("Error:", e instanceof Error ? e.message : String(e));
}
console.timeEnd("btoa ...new Uint8Array");

console.time("chunked");
const CHUNK_SIZE = 8192;
let result = "";
for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
  const chunk = bytes.subarray(i, i + CHUNK_SIZE) as unknown as number[];
  result += String.fromCharCode.apply(null, chunk);
}
btoa(result);
console.timeEnd("chunked");
