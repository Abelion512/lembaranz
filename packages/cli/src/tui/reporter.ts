import { spawn } from 'child_process';
import os from 'os';
import pkg from '../../package.json' assert { type: 'json' };

const REPO_URL = 'https://github.com/Abelion512/lembaranz';

function sanitizeStack(stack?: string): string {
    if (!stack) return 'No stack trace available';
    const home = os.homedir();
    // Replace absolute home path with ~ for privacy
    return stack.split(home).join('~');
}

export interface ReportMetadata {
    component?: string;
    action?: string;
    screen?: string;
}

export function generateIssueUrl(error: Error, metadata: ReportMetadata = {}): string {
    const title = encodeURIComponent(`[CRASH] ${error.name}: ${error.message}`);
    
    const bodyText = `
### 🚨 Lembaranz TUI Crash Report
*This report was generated automatically to assist in debugging.*

#### 🛠️ Error Details
- **Message:** ${error.message}
- **Component:** ${metadata.component || 'Global'}
- **Action:** ${metadata.action || 'Unknown'}
- **Screen:** ${metadata.screen || 'Unknown'}

#### 💻 Environment Context
- **Lembaranz Version:** ${pkg.version}
- **OS:** ${os.type()} ${os.release()} (${os.arch()})
- **Runtime:** ${process.version} (Bun/Node)
- **Uptime:** ${(process.uptime() / 60).toFixed(2)} minutes

#### 📜 Stack Trace
\`\`\`text
${sanitizeStack(error.stack)}
\`\`\`

#### 📝 Steps to Reproduce
1. [Please describe what you were doing when the crash occurred]
2. ...

---
*Powered by Lembaranz Autonomous Diagnostic Engine*
`.trim();

    const body = encodeURIComponent(bodyText);
    return `${REPO_URL}/issues/new?title=${title}&body=${body}`;
}

export function openReport(url: string): void {
    const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open';
    spawn(start, [url], { shell: false, stdio: 'ignore', detached: true }).unref();
}
