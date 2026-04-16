"use client";

import { useState } from "react";
import { Header, Footer, MobileMenu } from "@/components/site";
import { Shield, Zap, Lock, EyeOff } from "lucide-react";

export default function WhyPage() {
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
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-12">Why Lembaranzzz?</h1>
        <div className="grid gap-10">
          {[
            {
              icon: Shield,
              color: "text-blue-600 dark:text-blue-400",
              title: "Data Sovereignty",
              desc: "Your data is your most valuable asset. Lembaranzzz ensures your secrets never leave your device without strong zero-knowledge encryption.",
            },
            {
              icon: Zap,
              color: "text-orange-600 dark:text-orange-400",
              title: "Instant Performance",
              desc: "Since everything runs locally, there is zero network latency. Encryption and decryption happen in milliseconds.",
            },
            {
              icon: EyeOff,
              color: "text-green-600 dark:text-green-400",
              title: "Absolute Privacy",
              desc: "No telemetry, no analytics, no tracking. We don't know what you store or how you use the app.",
            },
            {
              icon: Lock,
              color: "text-red-600 dark:text-red-400",
              title: "Open Security",
              desc: "Open source means anyone can audit our code. Security through transparency, not through obscurity.",
            },
          ].map((s) => (
            <section key={s.title}>
              <div className="flex items-center gap-3 mb-3">
                <s.icon size={24} className={s.color} />
                <h2 className="text-lg font-semibold">{s.title}</h2>
              </div>
              <p className="text-zinc-500 leading-relaxed text-sm">{s.desc}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
