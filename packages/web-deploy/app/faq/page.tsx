"use client";

import { useState } from "react";
import { Header, Footer, MobileMenu } from "@/components/site";

const FAQS = [
  {
    q: "Does Lembaranzzz store my passwords on a server?",
    a: "No. Lembaranzzz is local-first. All data is stored locally on your device in AES-GCM 256-bit encrypted form.",
  },
  {
    q: "What if I forget my Master Password?",
    a: "Since we don't store your data, there is no way to recover your password unless you have your 12-word Recovery Phrase.",
  },
  {
    q: "Is Lembaranzzz free?",
    a: "Yes. Lembaranzzz is completely free and open source under the MIT license.",
  },
  {
    q: "Does it require internet?",
    a: "No. Lembaranzzz is designed to work 100% offline. No internet connection is required for any operation.",
  },
  {
    q: "Can I use it on multiple devices?",
    a: "Each device has its own vault. You can export and import vaults manually if needed.",
  },
];

export default function FAQPage() {
  const [lang, setLang] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <Header
        lang={lang}
        setLang={setLang}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        lang={lang}
        setLang={setLang}
      />
      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-12 text-center">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <h3 className="font-semibold mb-2 text-sm">{item.q}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
