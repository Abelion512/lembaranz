import { PoetProvider, PoetPlan } from './ai/types';
import { GeminiProvider } from './ai/GeminiProvider';
import { LocalProvider } from './ai/LocalProvider';
import { SecretScrubber } from './ai/SecretScrubber';
import { AuditLog } from './AuditLog';

/**
 * Poet Engine: Modular & Private AI Architecture.
 * Standardized as a class for maximum compatibility.
 */
export class Poet {
    static _provider: PoetProvider = new LocalProvider();

    /**
     * Sets the active AI provider.
     */
    static setProvider(type: 'gemini' | 'openai' | 'claude' | 'none') {
        switch (type) {
            case 'gemini': this._provider = new GeminiProvider(); break;
            case 'none': this._provider = new LocalProvider(); break;
            default: this._provider = new LocalProvider();
        }
    }

    /**
     * Smart Brain with Privacy Scrubbing.
     */
    static async think(context: string, instruction: string): Promise<PoetPlan> {
        // Step 1: Scrub Secrets
        const safeContext = SecretScrubber.scrub(context);
        const safeInstruction = SecretScrubber.scrub(instruction);

        // Step 2: Transparency Report (Audit)
        await AuditLog.log('INTELLIGENCE_REQUEST', {
            model: this._provider.name,
            context: safeContext,
            instruction: safeInstruction
        });

        // Step 3: Delegate to Provider
        const plan = await this._provider.think(safeContext, safeInstruction);

        // Step 4: Log Decision
        await AuditLog.log('SENTINEL_DECISION', plan);

        return plan;
    }

    /**
     * Heuristic methods.
     */
    static async suggestTags(content: string): Promise<string[]> {
        const clean = content.toLowerCase();
        const tags: string[] = [];
        if (clean.includes('koding') || clean.includes('bug')) tags.push('Developer');
        return tags;
    }

    static async suggestTitle(content: string): Promise<string> {
        return content.substring(0, 30);
    }

    static async smartSummary(content: string): Promise<string> {
        return content.substring(0, 150);
    }
}
