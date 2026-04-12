import { Context, Storage, Poet, VaultContext, Archive } from '@lembaranz/core';
import prompts from 'prompts';

export interface OpsiGlobal {
  saku?: boolean;
  pelataran?: boolean;
  ai?: string;
}

export const prepareContext = async (opts: OpsiGlobal): Promise<VaultContext> => {
  let context: VaultContext;

  if (opts.saku) context = 'saku';
  else if (opts.pelataran) context = 'pelataran';
  else context = await Context.detectContextAuto();

  if (opts.ai && opts.ai !== 'none') {
    Poet.setProvider(opts.ai as 'gemini' | 'none');
  }

  const path = await Context.resolvePath(context);
  await Storage.initialize(path);
  return context;
};

// Aliases for backward compatibility
export const siapkanKonteks = prepareContext;

export const openVaultCLI = async (): Promise<boolean> => {
  const res = await prompts({
    type: 'password',
    name: 'pw',
    message: 'Enter vault password:'
  });
  if (!res.pw) return false;

  const hasil = await Archive.unlockVault(res.pw);
  if (hasil.error) {
    console.log(`Failed to open vault: ${hasil.error.message}`);
    return false;
  }
  return !!hasil.data;
};

// Alias for backward compatibility
export const bukaBrankasCLI = openVaultCLI;

export const enterTUIScreen = () => {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[2J\x1b[H');
};

// Aliases for backward compatibility
export const masukLayarTUI = enterTUIScreen;

export const exitTUIScreen = () => {
  process.stdout.write('\x1b[?1049l');
};

// Alias for backward compatibility
export const keluarLayarTUI = exitTUIScreen;
