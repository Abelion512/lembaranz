import { Context, Storage, VaultContext, Archive, Sentinel } from '@lembaranzz/core';
import prompts from 'prompts';

export interface GlobalOptions {
  personal?: boolean;
  project?: boolean;
}

export const prepareContext = async (opts: GlobalOptions): Promise<VaultContext> => {
  let context: VaultContext;

  if (opts.personal) context = 'personal';
  else if (opts.project) context = 'project';
  else context = await Context.detectContextAuto();

  const path = await Context.resolvePath(context);
  await Storage.initialize(path);
  return context;
};

export const openVaultCLI = async (): Promise<boolean> => {
  const res = await prompts({
    type: 'password',
    name: 'pw',
    message: 'Enter vault password:'
  });
  if (!res.pw) return false;

  const rateCheck = Sentinel.checkRateLimit('vault-unlock');
  if (!rateCheck.allowed) {
    const remainingMs = (rateCheck.resetAt || 0) - Date.now();
    const minutes = Math.ceil(remainingMs / 60000);
    console.log(`Too many failed attempts. Try again in ${minutes} minute(s).`);
    return false;
  }

  const result = await Archive.unlockVault(res.pw);
  if (result.error) {
    const remaining = rateCheck.remaining !== undefined ? `${rateCheck.remaining} attempt(s) left` : 'locked';
    console.log(`Failed to open vault: ${result.error.message} [${remaining}]`);
    return false;
  }

  if (result.data === false) {
    console.log('Failed to open vault: Authentication failed.');
    return false;
  }

  Sentinel.resetRateLimit('vault-unlock');
  return result.data === true;
};

export const enterTUIScreen = () => {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[2J\x1b[H');
};

export const exitTUIScreen = () => {
  process.stdout.write('\x1b[?1049l');
};
