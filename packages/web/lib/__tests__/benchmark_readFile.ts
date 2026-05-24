import { readFile } from "../readFile";
import { performance } from "perf_hooks";

async function runBenchmark() {
    const iterations = 1000;
    const fileName = "docs/id/cli.md";

    console.log(`Running benchmark (async) for ${iterations} iterations...`);

    const start = performance.now();
    const promises = [];
    for (let i = 0; i < iterations; i++) {
        promises.push(readFile(fileName));
    }
    await Promise.all(promises);
    const end = performance.now();

    const totalTime = end - start;
    const averageTime = totalTime / iterations;

    console.log(`Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`Average time per call: ${averageTime.toFixed(4)}ms`);
}

runBenchmark();
