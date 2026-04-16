"use client";

import { useI18n } from "@/lib/i18n";
import { Header, Footer, MobileMenu } from "@/components/site";
import { useState } from "react";
import { Shield, Lock, Activity, Server, FileCheck2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityPage() {
  const { lang, setLang } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors">
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        actionsOpen={actionsOpen}
        setActionsOpen={setActionsOpen}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        lang={lang}
        setLang={setLang}
      />

      <main className="pt-24 pb-20 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Security Overview
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-12">
            Lembaranzzzz is built with a zero-trust, local-first architecture. We do not have access to your data, your passwords, or your encryption keys. The security of this application relies on industry-standard cryptography and open-source transparency.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-16">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <Lock className="text-zinc-400 mb-4" size={20} />
              <h3 className="font-semibold text-lg mb-2">Cryptographic Primitives</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                <li>AES-GCM 256-bit for data encryption</li>
                <li>Argon2id (t:3, m:65536) for key derivation</li>
                <li>Web Crypto API (Native Performance)</li>
                <li>No custom cryptographic algorithms</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <Server className="text-zinc-400 mb-4" size={20} />
              <h3 className="font-semibold text-lg mb-2">Architecture Model</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                <li>100% Local Execution</li>
                <li>Zero external API dependencies</li>
                <li>Strict Content Security Policy (CSP)</li>
                <li>Memory sanitization on lock</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <Activity className="text-zinc-400 mb-4" size={20} />
              <h3 className="font-semibold text-lg mb-2">Threat Mitigation</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                <li>Brute-force protection via High KDF costs</li>
                <li>XSS mitigation via React strict escaping</li>
                <li>Memory dumping mitigated by 5m TTL Cache</li>
                <li>Digital seals to prevent vault tampering</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <FileCheck2 className="text-zinc-400 mb-4" size={20} />
              <h3 className="font-semibold text-lg mb-2">Audit Status</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Static Analysis: Passing</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Dependency Audit: Clean</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> Independent Pentest: Scheduled</li>
              </ul>
            </div>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <h2>Vulnerability Disclosure Policy</h2>
            <p>
              We take security seriously. If you believe you have found a security vulnerability in Lembaranzzzz, please responsibly disclose it to us.
            </p>
            
            <h3>Reporting a Vulnerability</h3>
            <p>
              Please do NOT report security vulnerabilities through public GitHub issues. Instead, please email your findings directly to the maintainer.
            </p>
            <ul>
              <li><strong>Contact:</strong> security@lembaranzz.sh (or via direct contact to the maintainer)</li>
              <li>Include detailed steps to reproduce the vulnerability.</li>
              <li>Allow appropriate time for the vulnerability to be patched before public disclosure.</li>
            </ul>

            <h3>Recent Security Advisories</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm mt-4">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left">
                    <th className="py-3 px-4">Identifier</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Resolution</th>
                    <th className="py-3 px-4">Version Patched</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-3 px-4 font-mono text-xs">CVE-L01</td>
                    <td className="py-3 px-4"><span className="text-red-500">Critical</span></td>
                    <td className="py-3 px-4 text-zinc-500">Removed plaintext local storage caching</td>
                    <td className="py-3 px-4">v1.0.1</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-3 px-4 font-mono text-xs">CVE-L05</td>
                    <td className="py-3 px-4"><span className="text-amber-500">Moderate</span></td>
                    <td className="py-3 px-4 text-zinc-500">Upgraded KDF parameters to m:65536</td>
                    <td className="py-3 px-4">v1.0.1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 rounded-xl text-sm leading-relaxed border border-blue-100 dark:border-blue-900/30">
              <strong>Note on "Panic Key" Usage:</strong> Lembaranzzzz supports an optional Panic Key infrastructure. Entering your designated Panic Key will immediately and irreversibly destroy all local vault data, metadata, and keys. Use with extreme caution.
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
