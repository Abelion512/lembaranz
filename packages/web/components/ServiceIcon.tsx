'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    Key, Mail, Github,
    Layout, Bot, ShieldCheck,
    Calendar, Play
} from 'lucide-react';

/**
 * Common mappings for services to their official domains or abbreviations
 */
export const SERVICE_MAP: Record<string, string> = {
    "activecampaign": "activecampaign.com",
    "airtable": "airtable.com",
    "amazon": "amazon.com",
    "anthropic": "anthropic.com",
    "antigravity": "antigravity.id",
    "apple": "apple.com",
    "appwrite": "appwrite.io",
    "asana": "asana.com",
    "aws": "aws.amazon.com",
    "bca": "bca.co.id",
    "bigcommerce": "bigcommerce.com",
    "bitbucket": "bitbucket.org",
    "brevo": "brevo.com",
    "bubble": "bubble.io",
    "calendar": "calendar.google.com",
    "capcut": "capcut.com",
    "chatgpt": "chatgpt.com",
    "claude": "claude.ai",
    "claude.ai": "claude.ai",
    "clickup": "clickup.com",
    "context7": "context7.com",
    "dana": "dana.id",
    "deepseek": "deepseek.com",
    "dibimbing": "dibimbing.id",
    "dicoding": "dicoding.com",
    "digitalocean": "digitalocean.com",
    "discord": "discord.com",
    "docker": "docker.com",
    "doc": "docs.google.com",
    "docs": "docs.google.com",
    "drive": "drive.google.com",
    "dropbox": "dropbox.com",
    "excel": "excel.office.com",
    "facebook": "facebook.com",
    "firebase": "firebase.google.com",
    "fomz": "fomz.app",
    "gdocs": "docs.google.com",
    "gdrive": "drive.google.com",
    "gemini": "gemini.google.com",
    "ghost": "ghost.org",
    "github": "github.com",
    "gitlab": "gitlab.com",
    "gmail": "gmail.com",
    "gojek": "gojek.com",
    "google": "google.com",
    "google docs": "docs.google.com",
    "google drive": "drive.google.com",
    "google mail": "mail.google.com",
    "google sheet": "sheets.google.com",
    "google translate": "translate.google.com",
    "grab": "grab.com",
    "groq": "groq.com",
    "gsheet": "sheets.google.com",
    "gtask": "tasks.google.com",
    "heroku": "heroku.com",
    "hubspot": "hubspot.com",
    "icloud": "icloud.com",
    "ifttt": "ifttt.com",
    "instagram": "instagram.com",
    "jenkins": "jenkins.io",
    "jina": "jina.ai",
    "jira": "atlassian.com",
    "kafka": "kafka.apache.org",
    "lambda": "aws.amazon.com/lambda",
    "line": "line.me",
    "linear": "linear.app",
    "linkedin": "linkedin.com",
    "magento": "magento.com",
    "make": "make.com",
    "mandiri": "bankmandiri.co.id",
    "mattermost": "mattermost.com",
    "medium": "medium.com",
    "meta": "meta.com",
    "microsoft sql": "microsoft.com/sql-server",
    "midtrans": "midtrans.com",
    "mistral": "mistral.ai",
    "monday": "monday.com",
    "mongodb": "mongodb.com",
    "mssql": "microsoft.com/sql-server",
    "mysql": "mysql.com",
    "n8n": "n8n.io",
    "nasa": "nasa.gov",
    "neon": "neon.tech",
    "netflix": "netflix.com",
    "notion": "notion.so",
    "odoo": "odoo.com",
    "onedrive": "onedrive.live.com",
    "openai": "openai.com",
    "openrouter": "openrouter.ai",
    "openweathermap": "openweathermap.org",
    "outlook": "outlook.com",
    "ovo": "ovo.id",
    "pabbly": "pabbly.com",
    "pabbly connect": "pabbly.com/connect",
    "paypal": "paypal.com",
    "perplexity": "perplexity.ai",
    "pinterest": "pinterest.com",
    "pipedrive": "pipedrive.com",
    "postgres": "postgresql.org",
    "postgresql": "postgresql.org",
    "pushcut": "pushcut.io",
    "pushover": "pushover.net",
    "quickbooks": "intuit.com",
    "qwen": "qwenlm.ai",
    "railway": "railway.app",
    "reddit": "reddit.com",
    "redis": "redis.io",
    "redis.io": "redis.io",
    "render": "render.com",
    "retool": "retool.com",
    "s3": "aws.amazon.com/s3",
    "salesforce": "salesforce.com",
    "seatable": "seatable.io",
    "sendgrid": "sendgrid.com",
    "sheet": "sheets.google.com",
    "shopee": "shopee.co.id",
    "shopify": "shopify.com",
    "slack": "slack.com",
    "spotify": "spotify.com",
    "stitch": "stitch.dev",
    "stripe": "stripe.com",
    "supabase": "supabase.com",
    "surveymonkey": "surveymonkey.com",
    "telegram": "telegram.org",
    "tiktok": "tiktok.com",
    "tinybird": "tinybird.co",
    "todo": "todo.microsoft.com",
    "tokopedia": "tokopedia.com",
    "traveloka": "traveloka.com",
    "trello": "trello.com",
    "twilio": "twilio.com",
    "twitter": "x.com",
    "typeform": "typeform.com",
    "v0": "v0.dev",
    "vercel": "vercel.com",
    "webflow": "webflow.com",
    "wechat": "wechat.com",
    "whatsapp": "whatsapp.com",
    "wink": "wink.com",
    "woocommerce": "woocommerce.com",
    "wordpress": "wordpress.org",
    "x": "x.com",
    "xero": "xero.com",
    "youtube": "youtube.com",
    "yt": "youtube.com",
    "zapier": "zapier.com",
    "zendesk": "zendesk.com",
};

/**
 * Simple Levenshtein distance for fuzzy matching
 */
const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, () =>
        Array.from({ length: b.length + 1 }, (_, i) => i)
    );
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
};

const extractDomain = (input: string) => {
    if (!input) return null;
    const lower = input.toLowerCase().trim();

    // 1. If it's already a URL
    if (lower.startsWith('http')) {
        try {
            return new URL(lower).hostname;
        } catch (_e) {
            return null;
        }
    }

    // 2. Exact match in mapping
    if (SERVICE_MAP[lower]) return SERVICE_MAP[lower];

    // 3. Partial match (starts with) - Priority to exact match above
    for (const key in SERVICE_MAP) {
        if (lower.startsWith(key) || key.startsWith(lower)) {
            if (lower.length >= 2) return SERVICE_MAP[key];
        }
    }

    // 4. Fuzzy match (allow small typos)
    for (const key in SERVICE_MAP) {
        if (key.length > 3 && getLevenshteinDistance(lower, key) === 1) {
            return SERVICE_MAP[key];
        }
    }

    return null;
};

// --- High Fidelity Brand Icons ---

const GmailIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 6V18C1.5 19.1046 2.39543 20 3.5 20H5.5V9.5L12 14.5L18.5 9.5V20H20.5C21.6046 20 22.5 19.1046 22.5 18V6C22.5 4.89543 21.6046 4 20.5 4H18.5L12 9L5.5 4H3.5C2.39543 4 1.5 4.89543 1.5 6Z" fill="#EA4335" />
        <path d="M5.5 20V9.5L1.5 6.5V18C1.5 19.1046 2.39543 20 3.5 20H5.5Z" fill="#FBBC05" />
        <path d="M18.5 9.5V20H20.5C21.6046 20 22.5 19.1046 22.5 18V6.5L18.5 9.5Z" fill="#34A853" />
        <path d="M18.5 4V9.5L12 14.5L5.5 9.5V4L12 9L18.5 4Z" fill="#C5221F" />
        <path d="M5.5 4L1.5 1V6.5L5.5 9.5V4Z" fill="#4285F4" />
    </svg>
);

const DriveIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.52 2.47L15.48 2.47L23.44 16.47L20.01 22.42L6.01 22.42L0.56 12.92L8.52 2.47Z" fill="white" />
        <path d="M15.48 2.47L8.52 2.47L0.56 16.47L3.99 22.42L15.48 22.42L15.48 2.47Z" fill="#FFC107" />
        <path d="M23.44 16.47L16.59 4.62L13.17 10.57L20.01 22.42L23.44 16.47Z" fill="#2196F3" />
        <path d="M17.01 16.47L6.99 16.47L3.57 22.42L20.43 22.42L17.01 16.47Z" fill="#4CAF50" />
    </svg>
);

const SheetsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0F9D58" />
        <path d="M8 8h8v2H8V8zm0 3h8v2H8v-2zm0 3h8v2H8v-2z" fill="white" />
        <rect x="8" y="8" width="3" height="2" fill="#0B8043" opacity="0.4" />
        <rect x="8" y="11" width="3" height="2" fill="#0B8043" opacity="0.4" />
        <rect x="8" y="14" width="3" height="2" fill="#0B8043" opacity="0.4" />
    </svg>
);

const DocsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" fill="#4285F4" />
        <path d="M9 7h6v2H9V7zm0 4h6v2H9v-2zm0 4h4v2H9v-2z" fill="white" />
    </svg>
);

const OneDriveIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 14.5C6 12.0147 8.01472 10 10.5 10C10.7418 10 10.9752 10.0153 11.2031 10.0448C12.1868 7.07187 14.996 5 18.3 5C22.4421 5 25.8 8.35786 25.8 12.5C25.8 12.8719 25.773 13.2374 25.7207 13.5947C26.5062 14.3553 27 15.4199 27 16.6C27 19.03 25.03 21 22.6 21H6V14.5Z" fill="#0078D4" transform="translate(-4, -1) scale(0.8)" />
        <path d="M17.5 19C20.5376 19 23 16.5376 23 13.5C23 10.4624 20.5376 8 17.5 8C17.2618 8 17.0284 8.01525 16.8 8.04481C15.8163 5.07187 13.0071 3 9.7 3C5.55786 3 2.2 6.35786 2.2 10.5C2.2 10.8719 2.227 11.2374 2.27926 11.5947C1.4938 12.3553 1 13.4199 1 14.6C1 17.03 2.97 19 5.4 19H17.5Z" fill="#0078D4" />
        <path opacity="0.4" d="M17.5 19C20.5376 19 23 16.5376 23 13.5C23 10.4624 20.5376 8 17.5 8C17.2618 8 17.0284 8.01525 16.8 8.04481C15.8163 5.07187 13.0071 3 9.7 3C5.55786 3 2.2 6.35786 2.2 10.5C2.2 10.8719 2.227 11.2374 2.27926 11.5947C1.4938 12.3553 1 13.4199 1 14.6C1 17.03 2.97 19 5.4 19H17.5Z" fill="white" />
    </svg>
);

const ClaudeIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#D97757" />
        <path d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7ZM10.5 10C9.67157 10 9 10.6716 9 11.5V12.5C9 13.3284 9.67157 14 10.5 14H13.5C14.3284 14 15 13.3284 15 12.5V11.5C15 10.6716 14.3284 10 13.5 10H10.5Z" fill="#FAF9F5" />
        <rect x="10" y="11" width="1.5" height="2" rx="0.5" fill="#D97757" />
        <rect x="12.5" y="11" width="1.5" height="2" rx="0.5" fill="#D97757" />
    </svg>
);

const TikTokIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" fill="#25F4EE" transform="translate(-0.5, -0.5)" />
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" fill="#FE2C55" transform="translate(0.5, 0.5)" />
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" fill="#000000" />
    </svg>
);

const PinterestIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#E60023" />
        <path d="M12 2C6.48 2 2 6.48 2 12C2 16.23 4.63 19.85 8.39 21.32C8.3 20.53 8.23 19.33 8.41 18.57C8.58 17.88 9.49 14 9.49 14C9.49 14 9.21 13.44 9.21 12.61C9.21 11.29 9.97 10.3 10.92 10.3C11.73 10.3 12.12 10.91 12.12 11.64C12.12 12.45 11.6 13.67 11.33 14.83C11.11 15.79 11.82 16.57 12.76 16.57C14.47 16.57 15.78 14.77 15.78 12.17C15.78 9.95 14.18 8.39 11.9 8.39C9.26 8.39 7.73 10.37 7.73 12.39C7.73 13.19 8.04 14.04 8.42 14.51C8.49 14.59 8.5 14.66 8.48 14.75C8.42 15 8.3 15.48 8.27 15.61C8.24 15.75 8.15 15.78 8 15.71C7.05 15.27 6.45 13.88 6.45 12.35C6.45 9.38 8.6 6.7 12.24 6.7C15.16 6.7 17.43 8.78 17.43 11.58C17.43 14.48 15.6 16.81 13.06 16.81C12.21 16.81 11.4 16.37 11.13 15.85L10.45 18.43C10.2 19.39 9.57 20.58 9.15 21.28C10.05 21.75 11.05 22C12.1 22C17.62 22 22.1 17.52 22.1 12C22.1 6.48 17.62 2 12.1 2H12Z" fill="white" />
    </svg>
);

const CapCutIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="white" />
        <path d="M17 7L12 12L7 7M17 17L12 12L7 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2" fill="black" />
    </svg>
);

const WinkIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="black" />
        <path d="M6 12C6 12 8 15 12 15C16 15 18 12 18 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 8V9M16 8V9" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M19 5L17.5 6.5L19 8L20.5 6.5L19 5Z" fill="#FFD700" />
    </svg>
);

const FomzIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="1" />
        <circle cx="12" cy="12" r="8" fill="#111" />
        <path d="M12 6L13.5 10.5H18L14.5 13L16 17.5L12 15L8 17.5L9.5 13L6 10.5H10.5L12 6Z" fill="white" opacity="0.8" />
        <text x="12" y="16" fontSize="4" fill="white" textAnchor="middle" fontFamily="sans-serif">Fomz</text>
    </svg>
);

const WeChatIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z" fill="#1AAD19" />
        <path d="M17.065 8.86c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.86z" fill="#1AAD19" opacity="0.8" />
    </svg>
);

const QwenIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#6495ED" />
        <path d="M6 8h4v8H6zm0 0h4l4-4h4v12h-4l-4-4H6z" fill="white" />
        <path d="M14 4h4v12h-4z" fill="#C9C0D3" />
    </svg>
);

const N8NIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.48l7 3.5v7.84l-7-3.5V9.48zm16 0v7.84l-7 3.5v-7.84l7-3.5z" fill="#EA4B71" />
        <circle cx="12" cy="8" r="1.5" fill="#040506" />
        <circle cx="6" cy="12" r="1.5" fill="#040506" />
        <circle cx="18" cy="12" r="1.5" fill="#040506" />
        <circle cx="12" cy="16" r="1.5" fill="#040506" />
    </svg>
);

const AntigravityIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#F97316" strokeWidth="2" />
        <path d="M12 6V18M6 12H18" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" fill="#F97316" />
    </svg>
);

const MidtransIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" fill="#00AAD2" />
        <path d="M7 6h10l-5 12z" fill="#00558D" opacity="0.5" />
    </svg>
);

const DicodingIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#FE173A" />
        <path d="M8 8l8 4-8 4V8z" fill="white" />
    </svg>
);

const DibimbingIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#2D5F9F" />
        <path d="M6 8h12v2H6zm0 3h12v2H6zm0 3h8v2H6z" fill="white" />
        <circle cx="17" cy="16" r="2" fill="#FF6B35" />
    </svg>
);

const OpenRouterIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const GroqIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4c3.314 0 6 2.686 6 6s-2.686 6-6 6-6-2.686-6-6 2.686-6 6-6z" fill="#F55036" />
    </svg>
);

const AnthropicIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="#FAF9F5" />
        <path d="M8 4l4 16M12 4l4 16M6 12h12" stroke="#141413" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="4" r="1" fill="#D97757" />
        <circle cx="12" cy="4" r="1" fill="#6A9BCC" />
        <circle cx="16" cy="4" r="1" fill="#788C5D" />
    </svg>
);

export const getIconForService = (name: string, size: number = 20) => {
    if (!name) return null;
    return <OfficialIcon name={name} size={size} />;
};

const OfficialIcon = ({ name, size }: { name: string, size: number }) => {
    const [imgError, setImgError] = useState(false);
    const domain = extractDomain(name);
    const lowerName = name.toLowerCase();

    const getFallback = (searchString: string) => {
        const s = searchString.toLowerCase();

        // Exact brand match first
        if (s.includes("gmail") || s.includes("google mail")) return <GmailIcon size={size} />;
        if (s.includes("google drive") || s.includes("gdrive")) return <DriveIcon size={size} />;
        if (s.includes("google sheet") || s.includes("gsheet")) return <SheetsIcon size={size} />;
        if (s.includes("google docs") || s.includes("gdoc")) return <DocsIcon size={size} />;
        if (s.includes("onedrive")) return <OneDriveIcon size={size} />;
        if (s.includes("tiktok")) return <TikTokIcon size={size} />;
        if (s.includes("wechat")) return <WeChatIcon size={size} />;
        if (s.includes("qwen")) return <QwenIcon size={size} />;
        if (s.includes("n8n")) return <N8NIcon size={size} />;
        if (s.includes("claude.ai")) return <ClaudeIcon size={size} />;
        if (s.includes("anthropic")) return <AnthropicIcon size={size} />;
        if (s.includes("midtrans")) return <MidtransIcon size={size} />;
        if (s.includes("dicoding")) return <DicodingIcon size={size} />;
        if (s.includes("dibimbing")) return <DibimbingIcon size={size} />;
        if (s.includes("openrouter")) return <OpenRouterIcon size={size} />;
        if (s.includes("groq")) return <GroqIcon size={size} />;
        if (s.includes("antigravity")) return <AntigravityIcon size={size} />;
        if (s.includes("pinterest")) return <PinterestIcon size={size} />;
        if (s.includes("capcut")) return <CapCutIcon size={size} />;
        if (s.includes("wink")) return <WinkIcon size={size} />;
        if (s.includes("fomz")) return <FomzIcon size={size} />;

        // Category/Broad match fallback
        if (s.includes("mail")) return <Mail size={size} className="text-[#ea4335]" />;
        if (s.includes("drive")) return <DriveIcon size={size} />;
        if (s.includes("sheet") || s.includes("excel")) return <SheetsIcon size={size} />;
        if (s.includes("doc")) return <DocsIcon size={size} />;
        if (s.includes("calendar")) return <Calendar size={size} className="text-[#ea4335]" />;
        if (s.includes("youtube") || s.includes("yt")) return <Play size={size} className="text-[#ff0000]" />;
        if (s.includes("stitch")) return <Layout size={size} className="text-purple-500" />;
        if (s.includes("github")) return <Github size={size} className="text-gray-900 dark:text-white" />;
        if (s.includes("bot") || s.includes("ai")) return <Bot size={size} className="text-[#4285f4]" />;
        if (s.includes("credentials") || s.includes("login")) return <Key size={size} className="text-yellow-600" />;

        return <ShieldCheck size={size} className="text-blue-500 opacity-20" />;
    };

    const searchContext = `${lowerName} ${domain || ''}`;
    const needsSpecificIcon =
        searchContext.includes("gmail") ||
        searchContext.includes("drive") ||
        searchContext.includes("doc") ||
        searchContext.includes("sheet") ||
        searchContext.includes("onedrive") ||
        searchContext.includes("claude") ||
        searchContext.includes("anthropic") ||
        searchContext.includes("tiktok") ||
        searchContext.includes("wechat") ||
        searchContext.includes("qwen") ||
        searchContext.includes("n8n") ||
        searchContext.includes("midtrans") ||
        searchContext.includes("dicoding") ||
        searchContext.includes("dibimbing") ||
        searchContext.includes("openrouter") ||
        searchContext.includes("groq") ||
        searchContext.includes("antigravity") ||
        searchContext.includes("pinterest") ||
        searchContext.includes("capcut") ||
        searchContext.includes("wink") ||
        searchContext.includes("fomz");

    if (needsSpecificIcon) {
        return getFallback(searchContext);
    }

    if (domain && !imgError && domain !== 'google.com') {
        return (
            <Image
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                alt={name}
                width={size}
                height={size}
                key={domain}
                className="rounded-sm object-contain"
                onError={() => setImgError(true)}
                unoptimized
            />
        );
    }

    return getFallback(lowerName);
};
