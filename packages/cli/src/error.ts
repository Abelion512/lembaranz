import pc from 'picocolors';
import readline from 'node:readline';
import { spawnSync } from 'node:child_process';

interface ErrorContext {
  step?: string;
  os?: string;
  nodeVersion?: string;
  vaultStatus?: string;
  [key: string]: any;
}

export const ERROR_CODES = {
  VAULT_ACCESS: 'L-VAULT-001',
  INCORRECT_PASSWORD: 'L-VAULT-002',
  VAULT_NOT_FOUND: 'L-VAULT-003',
  INTEGRITY_MISMATCH: 'L-SEC-001',
  SESSION_TIMEOUT: 'L-SEC-002',
  SECURITY_VIOLATION: 'L-SEC-003',
  PERMISSION_DENIED: 'L-SYS-001',
  DEPENDENCY_MISSING: 'L-SYS-002',
} as const;

export class LembaranzError extends Error {
  code: string;
  context: ErrorContext;
  hints: string[];

  constructor(code: string, message: string, hints: string[] = [], context: ErrorContext = {}) {
    super(message);
    this.name = 'LembaranzError';
    this.code = code;
    this.hints = hints;
    this.context = {
      os: process.platform,
      nodeVersion: process.version,
      ...context
    };
  }
}

export function reportToGithub(error: unknown) {
  let title: string;
  let body: string;
  const labels = 'bug,auto-report';

  if (error instanceof LembaranzError) {
    title = `[${error.code}] ${error.message}`;
    body = `**Error Code:** ${error.code}\n**Message:** ${error.message}\n**OS:** ${error.context.os}\n**Node:** ${error.context.nodeVersion}\n\n**Hints:**\n${error.hints.join('\n')}`;
  } else {
    const msg = error instanceof Error ? error.message : String(error);
    title = `[Crash] ${msg.slice(0, 50)}`;
    body = `**Message:** ${msg}\n**OS:** ${process.platform}\n**Node:** ${process.version}`;
  }

  const issueUrl = new URL('https://github.com/Abelion512/lembaranz/issues/new');
  issueUrl.searchParams.append('title', title);
  issueUrl.searchParams.append('labels', labels);
  issueUrl.searchParams.append('body', body);
  
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  spawnSync(startCmd, [issueUrl.toString()]);
}

export async function handleError(error: unknown) {
  console.log('\n');

  if (error instanceof LembaranzError) {
    console.log(pc.red(`✗ ${error.code} — ${error.message}`));
    
    if (error.hints.length > 0) {
      console.log(pc.yellow('\n  Kemungkinan penyebab:'));
      error.hints.forEach(hint => {
        console.log(`  → ${hint}`);
      });
    }

    console.log(pc.dim('\n  Environment:'));
    console.log(pc.dim(`  OS: ${error.context.os} · Node: ${error.context.nodeVersion}`));
  } else {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(pc.red(`✗ Unexpected Error: ${msg}`));
  }

  console.log('\n  ' + pc.bold('Tekan [Enter] untuk melaporkan ke GitHub →'));
  console.log(pc.dim('  (Ctrl+C untuk lewati)\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<void>((resolve) => {
    rl.question('', () => {
      rl.close();
      reportToGithub(error);
      resolve();
    });
    
    rl.on('SIGINT', () => {
      rl.close();
      console.log();
      resolve();
    });
  });
}
