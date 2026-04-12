import { Context, Storage, VaultContext, Archive, Sentinel } from '@lembaranz/core';
import prompts from 'prompts';

export interface OpsiGlobal {
  saku?: boolean;
  pelataran?: boolean;
}

export const prepareContext = async (opts: OpsiGlobal): Promise<VaultContext> => {
  let context: VaultContext;

  if (opts.saku) context = 'saku';
  else if (opts.pelataran) context = 'pelataran';
  else context = await Context.detectContextAuto();

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

  // Rate limit check: max 5 attempts, 5-minute lockout
  const rateCheck = Sentinel.checkRateLimit('vault-unlock');
  if (!rateCheck.allowed) {
    const remainingMs = (rateCheck.resetAt || 0) - Date.now();
    const minutes = Math.ceil(remainingMs / 60000);
    console.log(`🔒 Too many failed attempts. Try again in ${minutes} minute(s).`);
    return false;
  }

  const hasil = await Archive.unlockVault(res.pw);
  if (hasil.error) {
    const remaining = rateCheck.remaining !== undefined ? `${rateCheck.remaining} attempt(s) left` : 'locked';
    console.log(`Failed to open vault: ${hasil.error.message} [${remaining}]`);
    return false;
  }

  // Reset rate limit on successful unlock
  Sentinel.resetRateLimit('vault-unlock');
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
