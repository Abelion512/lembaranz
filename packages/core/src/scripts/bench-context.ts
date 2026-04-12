import { Context } from '../Context';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function runBench() {
    console.log('Setting up benchmark environment...');
    const tempDir = join(tmpdir(), `laras-bench-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
    await writeFile(join(tempDir, 'package.json'), '{}');

    const envPath = join(tempDir, '.env');
    let envContent = '';
    for (let i = 0; i < 100; i++) {
        envContent += `KEY_${i}=VALUE_${i}\n`;
    }
    await writeFile(envPath, envContent);

    // Change CWD to tempDir for Context to find it as root
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const ITERATIONS = 1000;

    console.log(`Running readEnv benchmark (${ITERATIONS} iterations)...`);
    const startRead = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await Context.readEnv();
    }
    const endRead = performance.now();
    const readTime = endRead - startRead;
    console.log(`Total Read Time: ${readTime.toFixed(2)}ms`);
    console.log(`Avg Read Time: ${(readTime / ITERATIONS).toFixed(4)}ms`);

    console.log(`Running writeEnv benchmark (${ITERATIONS} iterations)...`);
    const startWrite = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await Context.writeEnv(`NEW_KEY_${i}`, `NEW_VALUE_${i}`);
    }
    const endWrite = performance.now();
    const writeTime = endWrite - startWrite;
    console.log(`Total Write Time: ${writeTime.toFixed(2)}ms`);
    console.log(`Avg Write Time: ${(writeTime / ITERATIONS).toFixed(4)}ms`);

    // Functional Check
    console.log('Verifying functional correctness...');
    const env = await Context.readEnv();
    if (env['NEW_KEY_999'] === 'NEW_VALUE_999') {
        console.log('Functional Check: PASS');
    } else {
        console.log('Functional Check: FAIL (Expected NEW_VALUE_999 for NEW_KEY_999)');
        console.log('Value found:', env['NEW_KEY_999']);
    }

    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
    console.log('Benchmark environment cleaned up.');
}

runBench().catch(console.error);
