/**
 * Coverage gate.
 *
 * Bun's test runner reports coverage but has no built-in threshold support, so
 * a floor enforced in CI has to read the table itself. This wrapper runs the
 * suite, echoes its output untouched so a failing test stays visible, then
 * compares one coverage row against a floor and exits non-zero.
 *
 * Three things it deliberately does not do:
 *
 *  - Swallow the runner's exit code. A suite that fails is a failing gate even
 *    if the coverage number happens to clear the floor, and a green gate that
 *    hid a red test run would be the worst possible bug in the gate itself.
 *  - Guess when the row cannot be read. An unparseable report exits non-zero
 *    rather than passing, because a coverage check that cannot see the number is
 *    not a coverage check.
 *  - Fall back to a different row than the one asked for. `--row` exists so the
 *    server suite can be gated on `packages/server/src/index.ts` instead of the
 *    aggregate, which also counts the core files the server happens to load and
 *    would happily rise for reasons that have nothing to do with the server.
 *
 * Usage:
 *   bun scripts/coverage-gate.ts --label core --floor 73 -- bun test --coverage ./packages/core
 *   bun scripts/coverage-gate.ts --label server --row packages/server --floor 84 -- bun test --coverage ./packages/server
 */
const args = process.argv.slice(2);

function flag(name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

const separator = args.indexOf('--');
if (separator === -1) {
  console.error('coverage-gate: missing `--` before the command to run.');
  process.exit(2);
}

const floor = Number(flag('--floor'));
const label = flag('--label') ?? 'suite';
const rowNeedle = flag('--row') ?? 'All files';
const command = args.slice(separator + 1);

if (!Number.isFinite(floor)) {
  console.error(`coverage-gate: --floor must be a number, got ${String(flag('--floor'))}.`);
  process.exit(2);
}
if (command.length === 0) {
  console.error('coverage-gate: no command given after `--`.');
  process.exit(2);
}

const child = Bun.spawn(command, { stdout: 'pipe', stderr: 'pipe' });

// Bun writes the coverage table to stderr, not stdout. Piping only one of the
// two is how this gate ended up reporting "no All files row" against a run that
// plainly printed one, so both streams are captured and searched together.
const [stdout, stderr] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text()]);
await child.exited;

// Forward the runner's own report verbatim: a reader debugging a failure needs
// the same output they would get running the suite directly.
process.stdout.write(stdout);
process.stderr.write(stderr);

if (child.exitCode !== 0) {
  console.error(`\ncoverage-gate: ${label} tests exited ${child.exitCode}.`);
  process.exit(child.exitCode);
}

const output = `${stdout}\n${stderr}`;
const rows = output.split('\n');
const matches = rows.filter((line) => {
  const file = line.split('|')[0]?.trim() ?? '';
  return file !== '' && file.includes(rowNeedle);
});

if (matches.length === 0) {
  console.error(`coverage-gate: no coverage row matching "${rowNeedle}"; cannot verify the floor.`);
  process.exit(1);
}

/**
 * Bun prints `File | % Funcs | % Lines | Uncovered Line #s`. After the leading
 * file label, cell 0 is functions and cell 1 is lines. Reading the wrong column
 * is silent and dangerous: a floor set between the two numbers would pass while
 * line coverage was actually short, which is why the column is named here and
 * the floor is set below both.
 */
function linePercent(row: string): number {
  const cells = row
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell !== '');
  return Number(cells[2]);
}

const row = matches[matches.length - 1];
const measured = linePercent(row);
if (!Number.isFinite(measured)) {
  console.error(`coverage-gate: could not read a line-coverage percentage from: ${row.trim()}`);
  process.exit(1);
}

const target = row.split('|')[0]?.trim() ?? rowNeedle;
const verdict = measured >= floor ? 'meets' : 'is below';
console.log(`coverage-gate: ${label} line coverage ${measured}% (${target}) ${verdict} the ${floor}% floor.`);

if (measured < floor) {
  process.exit(1);
}
