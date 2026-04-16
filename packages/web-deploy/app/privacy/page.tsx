"use client";

import { useState } from "react";
import { Shield, Eye, Database, CloudOff, Lock } from "lucide-react";
import { Header, Footer, MobileMenu } from "@/components/site";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">
          Last updated: April 13, 2026
        </p>
        <div className="space-y-6">
          {[
            {
              icon: Shield,
              color: "text-green-500",
              title: "Zero Data Collection",
              desc: "Lembaranzzz does not collect, store, or transmit any of your data. All encryption happens locally.",
            },
            {
              icon: Eye,
              color: "text-blue-500",
              title: "No Telemetry",
              desc: "We do not track your usage, analytics, or behavior. No tracking cookies, no telemetry.",
            },
            {
              icon: Database,
              color: "text-purple-500",
              title: "Local Storage Only",
              desc: "Your vault is stored at ~/.lembaranz/vault.db on your device.",
            },
            {
              icon: CloudOff,
              color: "text-orange-500",
              title: "No Cloud Sync",
              desc: "Lembaranzzz does not sync your data to any cloud service.",
            },
            {
              icon: Lock,
              color: "text-red-500",
              title: "No Account Required",
              desc: "No email, no registration, no personal information needed.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
            >
              <s.icon size={20} className={`${s.color} shrink-0 mt-0.5`} />
              <div>
                <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
