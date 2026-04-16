"use client";

import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, Monitor, Globe, BookOpen, ChevronRight, X } from "lucide-react";

export function UnifiedInteractionControl() {
  const { lang, setLang, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const containerRef = useRef<HTMLDivElement>(null);

  // Load theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("lembaranz-theme") as any;
    if (stored) setTheme(stored);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(nextTheme);
    localStorage.setItem("lembaranz-theme", nextTheme);
    
    if (nextTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    }
  };

  const toggleLang = () => {
    const langs: ("en" | "id" | "zh" | "ko")[] = ["en", "id", "zh", "ko"];
    const currentIndex = langs.indexOf(lang as any);
    const nextLang = langs[(currentIndex + 1) % langs.length];
    setLang(nextLang);
  };

  const handleAsk = () => {
    // Open modal or link
    window.location.href = "/docs/ai-assistant";
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* The Unified Dock */}
      <div 
        className={`flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full transition-all duration-300 ease-out overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-700/50 ${
          isOpen ? "w-[240px] px-1 py-1" : "w-10 h-10 justify-center cursor-pointer hover:scale-105"
        }`}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {!isOpen && (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            {/* Morphing icon based on theme */}
            <div className="relative w-4 h-4">
              <Sun className={`absolute inset-0 transition-transform duration-500 ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} size={16} />
              <Moon className={`absolute inset-0 transition-transform duration-500 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} size={16} />
              <Monitor className={`absolute inset-0 transition-transform duration-500 ${theme === 'system' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} size={16} />
            </div>
          </div>
        )}

        {isOpen && (
          <div className="flex items-center justify-between w-full h-8 gap-1">
            {/* Theme Toggle */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              className="flex items-center justify-center h-full flex-1 rounded-full hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors group"
              title={t(theme)}
            >
              {theme === "light" && <Sun size={14} className="group-hover:text-amber-500" />}
              {theme === "dark"  && <Moon size={14} className="group-hover:text-blue-400" />}
              {theme === "system" && <Monitor size={14} />}
            </button>

            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600" />

            {/* Language Toggle */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLang(); }}
              className="flex items-center justify-center h-full flex-1 rounded-full hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors gap-1.5 font-medium text-xs uppercase"
              title="Change Language"
            >
              <Globe size={12} />
              {lang}
            </button>

            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600" />

            {/* Ask Assistant */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleAsk(); }}
              className="flex items-center justify-center h-full flex-1 rounded-full hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors group"
              title={t("askAI")}
            >
              <BookOpen size={14} className="group-hover:text-purple-500" />
            </button>

            {/* Close Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="flex items-center justify-center w-8 h-full rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
