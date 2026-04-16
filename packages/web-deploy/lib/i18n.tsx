"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type LanguageCode = "en" | "id" | "zh" | "ko";

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lembaranzz-lang") as LanguageCode;
    if (stored && ["en", "id", "zh", "ko"].includes(stored)) {
      setLangState(stored);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (["en", "id", "zh", "ko"].includes(browserLang)) {
        setLangState(browserLang as LanguageCode);
      }
    }
  }, []);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem("lembaranzz-lang", newLang);
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        copyPage: "Copy page",
        viewMarkdown: "View as Markdown",
        askAI: "Ask AI Assistant",
        exportPDF: "Export as PDF",
        privacy: "Privacy",
        terms: "Terms",
        changelog: "Changelog",
        security: "Security",
        github: "GitHub",
        home: "Home",
        docs: "Docs",
        why: "Why",
        faq: "FAQ",
        light: "Light",
        dark: "Dark",
        system: "System",
      },
      id: {
        copyPage: "Salin halaman",
        viewMarkdown: "Lihat Markdown",
        askAI: "Tanya Asisten AI",
        exportPDF: "Ekspor PDF",
        privacy: "Privasi",
        terms: "Ketentuan",
        changelog: "Catatan Rilis",
        security: "Keamanan",
        github: "GitHub",
        home: "Beranda",
        docs: "Dokumentasi",
        why: "Mengapa",
        faq: "FAQ",
        light: "Terang",
        dark: "Gelap",
        system: "Sistem",
      },
      zh: {
        copyPage: "复制页面",
        viewMarkdown: "查看 Markdown",
        askAI: "询问 AI 助手",
        exportPDF: "导出 PDF",
        privacy: "隐私",
        terms: "条款",
        changelog: "更新日志",
        security: "安全",
        github: "GitHub",
        home: "首页",
        docs: "文档",
        why: "为什么",
        faq: "常见问题",
        light: "浅色",
        dark: "深色",
        system: "系统",
      },
      ko: {
        copyPage: "페이지 복사",
        viewMarkdown: "마크다운 보기",
        askAI: "AI 어시스턴트에게 묻기",
        exportPDF: "PDF로 내보내기",
        privacy: "개인정보 보호",
        terms: "이용약관",
        changelog: "변경 로그",
        security: "보안",
        github: "GitHub",
        home: "홈",
        docs: "문서",
        why: "왜",
        faq: "자주 묻는 질문",
        light: "라이트",
        dark: "다크",
        system: "시스템",
      }
    };
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }
  return context;
}
