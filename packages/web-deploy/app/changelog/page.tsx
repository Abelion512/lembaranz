"use client";

import { useState } from "react";
import { Header, Footer, MobileMenu } from "@/components/site";
import { RELEASES } from "@/lib/changelog-data";
import {
  Check,
  Plus,
  ArrowRightCircle,
  AlertCircle,
  ChevronDown,
  Download,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  added: "text-green-600 dark:text-green-400",
  changed: "text-blue-600 dark:text-blue-400",
  fixed: "text-orange-600 dark:text-orange-400",
  removed: "text-red-600 dark:text-red-400",
};
const TYPE_ICONS: Record<string, typeof Plus> = {
  added: Plus,
  changed: ArrowRightCircle,
  fixed: Check,
  removed: AlertCircle,
};

export default function ChangelogPage() {
  const [lang, setLang] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [openRelease, setOpenRelease] = useState<string | null>("1.0.1");

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <Header
        lang={lang}
        setLang={setLang}
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
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Changelog</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">
          All notable changes to this project.
        </p>
        <div className="space-y-4">
          {RELEASES.map((r) => {
            const rel = r as any;
            const isOpen = openRelease === rel.version;
            return (
              <div
                key={rel.version}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenRelease(isOpen ? null : rel.version)}
                  className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold font-mono">
                      v{rel.version}
                    </span>
                    <span className="text-xs text-zinc-400">{rel.date}</span>
                    {rel.tag === "latest" && (
                      <span className="text-[10px] px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                        Latest
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 border-t border-zinc-200 dark:border-zinc-800">
                    {/* Native visual slot (No AI frames) */}
                    <div className="mt-4 mb-6 p-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
                      <Download size={24} className="mb-2" />
                      <p className="text-xs font-medium">Replace with real screenshot</p>
                      <p className="text-[10px] text-zinc-400 mt-1 text-center">
                        Save your clean screenshot to <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">public/release-{rel.version}.png</code><br/>
                        and update this `img` tag.
                      </p>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                      {rel.summary}
                    </p>

                    {rel.stats && (
                      <div className="flex gap-3 mb-4 flex-wrap">
                        {rel.stats.added > 0 && (
                          <span className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Plus size={12} />
                            {rel.stats.added} added
                          </span>
                        )}
                        {rel.stats.changed > 0 && (
                          <span className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <ArrowRightCircle size={12} />
                            {rel.stats.changed} changed
                          </span>
                        )}
                        {rel.stats.fixed > 0 && (
                          <span className="text-xs flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <Check size={12} />
                            {rel.stats.fixed} fixed
                          </span>
                        )}
                      </div>
                    )}
                    <div className="space-y-4 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                      {rel.changes.map((c: any) => {
                        const Icon = TYPE_ICONS[c.type] || Plus;
                        return (
                          <div key={c.type}>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon size={14} className={TYPE_COLORS[c.type]} />
                              <span
                                className={`text-xs font-semibold uppercase tracking-wider ${TYPE_COLORS[c.type]}`}
                              >
                                {c.type}
                              </span>
                            </div>
                            <ul className="space-y-1.5">
                              {c.items.map((item: string) => (
                                <li
                                  key={item}
                                  className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-2 shrink-0" />
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
