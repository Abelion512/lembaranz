"use client";

import { useState } from "react";
import { Header, Footer, MobileMenu } from "@/components/site";

export default function TermsPage() {
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
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">
          Last updated: April 13, 2026
        </p>
        <div className="space-y-6">
          {[
            {
              title: "MIT License",
              desc: "Lembaranzzz is distributed under the MIT License. You are free to use, modify, and distribute the software.",
            },
            {
              title: "No Warranty",
              desc: "The software is provided 'as is', without warranty of any kind. Use at your own risk.",
            },
            {
              title: "Your Responsibility",
              desc: "You are solely responsible for securing your password and recovery phrase. We cannot recover lost credentials.",
            },
            {
              title: "No Liability",
              desc: "The authors shall not be liable for any damages arising from the use of this software.",
            },
            {
              title: "Open Source",
              desc: "Full source code is available at github.com/Abelion512/lembaranz. You may audit, modify, and contribute.",
            },
          ].map((t) => (
            <div
              key={t.title}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <h3 className="text-sm font-semibold mb-1">{t.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
