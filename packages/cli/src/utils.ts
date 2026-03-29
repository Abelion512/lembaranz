import { Laras, Gudang, Pujangga, KonteksLaras, Arsip } from '@abelionorg/core';
import prompts from 'prompts';

export interface OpsiGlobal {
  saku?: boolean;
  pelataran?: boolean;
  ai?: string;
}

export const siapkanKonteks = async (opts: OpsiGlobal): Promise<KonteksLaras> => {
  let konteks: KonteksLaras;

  if (opts.saku) konteks = 'saku';
  else if (opts.pelataran) konteks = 'pelataran';
  else konteks = await Laras.deteksiKonteksOtomatis();

  if (opts.ai && opts.ai !== 'none') {
    Pujangga.setProvider(opts.ai as 'gemini' | 'none');
  }

  const jalur = await Laras.temukanJalur(konteks);
  await Gudang.inisialisasi(jalur);
  return konteks;
};

export const bukaBrankasCLI = async (): Promise<boolean> => {
  const res = await prompts({
    type: 'password',
    name: 'pw',
    message: 'Masukkan kata sandi brankas:'
  });
  if (!res.pw) return false;
  
  const hasil = await Arsip.unlockVault(res.pw);
  if (hasil.error) {
    console.log(`❌ Gagal membuka brankas: ${hasil.error.message}`);
    return false;
  }
  return !!hasil.data;
};

export const masukLayarTUI = () => {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[2J\x1b[H');
};

export const keluarLayarTUI = () => {
  process.stdout.write('\x1b[?1049l');
};
