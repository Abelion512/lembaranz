import React from "react";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

export default function SecurityDocs() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight mb-3">
        Security & Encryption
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Lembaranzzz uses industry-standard encryption to protect your credentials.
      </p>
      <div className="mb-8 p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
        <ImageIcon size={24} className="mb-2" />
        <p className="text-xs">Security architecture diagram</p>
        <p className="text-[10px] text-zinc-400 mt-1">
          1200 × 675px recommended
        </p>
      </div>
      <section id="aes-gcm" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">AES-GCM 256-bit</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Advanced Encryption Standard in Galois/Counter Mode with 256-bit keys.
          The same standard used by governments and financial institutions
          worldwide.
        </p>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            Encrypts: Note content, credentials, .env files
          </p>
        </div>
      </section>
      <section id="argon2id" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Argon2id Key Derivation</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Winner of the Password Hashing Competition (2015). Memory-hard,
          resistant to GPU and ASIC attacks. Each vault uses a unique random
          salt.
        </p>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            Parameters: 19 MB memory, 2 iterations, unique salt
          </p>
        </div>
      </section>
      <section id="sha-256" className="mb-12">
        <h2 className="text-lg font-semibold mb-3">SHA-256 Integrity Seal</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Every note has a SHA-256 hash that acts as a digital seal. Tampering
          with encrypted data breaks the seal and triggers a warning.
        </p>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            Detects: File corruption, unauthorized modifications
          </p>
        </div>
      </section>
    </>
  );
}
