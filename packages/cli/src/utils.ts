/**
 * Shared CLI helpers.
 *
 * `prepareContext` resolves the vault path for the chosen context and
 * initializes storage; every command calls it before touching the vault.
 * `openVaultCLI` is the shared password gate: it prompts and delegates to
 * `Archive.unlockVault`, which owns the rate limiting and resets the counter
 * on success.
 */
import { Context, Storage, VaultContext, Archive } from '@lembaranz/core';
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

  // Rate limiting lives in Archive.unlockVault, not here. It used to sit only
  // in this function, which left `lembaranz server` (which calls unlockVault
  // directly) as an unthrottled password oracle. Keeping a second check here
  // would also double-count every attempt against the same bucket.
  const result = await Archive.unlockVault(res.pw);
  if (result.error) {
    console.log(`Failed to open vault: ${result.error.message}`);
    return false;
  }

  if (result.data === false) {
    console.log('Failed to open vault: Authentication failed.');
    return false;
  }

  return result.data === true;
};

export const enterTUIScreen = () => {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[2J\x1b[H');
};

export const exitTUIScreen = () => {
  process.stdout.write('\x1b[?1049l');
};
