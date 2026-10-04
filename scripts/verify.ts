/**
 * The verification gate.
 *
 * Every phase gate in the brief is a command that exits 0, and every one of them
 * is `bun run verify`. Keeping the list in one file rather than in a shell string
 * buys three things that matter more than the convenience:
 *
 *  - The step order is visible and each step is named, so a failure says which
 *    gate broke instead of dying inside a nested `&&` chain with no context.
 *  - The exit code is the child's, so a failing step fails the gate.
 *  - A new contributor reads one file to learn what "green" means.
 *
 * The steps run in cheapest-and-most-likely-to-fail first: lint and the design
 * detector catch seconds-long problems before a four-package typecheck, and the
 * tests run before the dashboard build because a failing test is a better error
 * message than a Vite stack trace.
 *
 * `SKIP_BUILD=1` exists for the inner edit loop only. CI never sets it.
 */
interface Step {
  name: string;
  command: string[];
}

const steps: Step[] = [
  { name: 'lint', command: ['bun', 'run', 'lint'] },
  { name: 'design anti-slop (impeccable)', command: ['bun', 'run', 'lint:design'] },
  { name: 'typecheck core', command: ['bun', 'run', 'typecheck:core'] },
  { name: 'typecheck cli', command: ['bun', 'run', 'typecheck:cli'] },
  { name: 'typecheck server', command: ['bun', 'run', 'typecheck:server'] },
  { name: 'typecheck dashboard', command: ['bun', 'run', 'typecheck:dashboard'] },
  { name: 'tests: core', command: ['bun', 'run', 'test:coverage:core'] },
  { name: 'tests: cli', command: ['bun', 'run', 'test:coverage:cli'] },
  { name: 'tests: server', command: ['bun', 'run', 'test:coverage:server'] },
  { name: 'tests: dashboard', command: ['bun', 'run', 'test:coverage:dashboard'] },
  { name: 'render harness', command: ['bun', 'run', 'verify:render'] },
];

if (process.env.SKIP_BUILD !== '1') {
  steps.push({ name: 'build dashboard', command: ['bun', 'run', 'build'] });
}

let failed: Step | null = null;

for (const [index, step] of steps.entries()) {
  const position = `${index + 1}/${steps.length}`;
  console.log(`\n=== [${position}] ${step.name} ===`);

  const child = Bun.spawn(step.command, { stdout: 'inherit', stderr: 'inherit' });
  const code = await child.exited;

  if (code !== 0) {
    failed = step;
    console.error(`\nverify: "${step.name}" exited ${code}. Gate failed.`);
    break;
  }
}

if (failed) {
  process.exit(1);
}

console.log('\nverify: all steps passed.');
