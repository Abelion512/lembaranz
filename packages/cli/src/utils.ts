import { Context, Storage, VaultContext, Archive } from '@lembaranz/core';
import prompts from 'prompts';

export interface GlobalOptions {
  saku?: boolean;
  pelataran?: boolean;
}

export const prepareContext = async (opts: GlobalOptions): Promise<VaultContext> => {
  let context: VaultContext;

  if (opts.saku) context = 'saku';
  else if (opts.pelataran) context = 'pelataran';
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

  const result = await Archive.unlockVault(res.pw);
  if (result.error) {
    console.log(`Failed to open vault: ${result.error.message}`);
    return false;
  }

  return !!result.data;
};

export const enterTUIScreen = () => {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[2J\x1b[H');
};

export const exitTUIScreen = () => {
  process.stdout.write('\x1b[?1049l');
};
