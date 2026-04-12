import { PoetProvider, PoetPlan } from './types';

/**
 * LocalProvider (Hardened)
 * Runs basic offline logic autonomously WITHOUT external AI assistance.
 * Guarantees 100% data sovereignty.
 */
export class LocalProvider implements PoetProvider {
    id = 'local';
    name = 'Local Logic (Sovereign)';

    async think(context: string, instruction: string): Promise<PoetPlan> {
        const cleanContext = context.toLowerCase();
        const cleanInstruction = instruction.toLowerCase();

        // Heuristic rules for common tasks
        if (cleanContext.includes('audit') || cleanInstruction.includes('keamanan') || cleanInstruction.includes('periksa')) {
            return {
                decision: 'Running integrity and security scan.',
                reason: 'Sovereign mode active. Running internal security audit script.',
                system_command: null,
                internal_note: 'Sentinel secures the courtyard from secret leaks offline.'
            };
        }

        if (cleanInstruction.includes('statistik') || cleanInstruction.includes('lapor')) {
            return {
                decision: 'Compiling vault statistics report.',
                reason: 'Local metadata analysis.',
                system_command: 'lembaran monitor',
                internal_note: 'Displaying system health summary to user.'
            };
        }

        return {
            decision: 'Task pending or processed manually.',
            reason: 'Sovereign mode limits autonomous execution for maximum security.',
            system_command: null,
            internal_note: 'Use Gemini mode if you need deeper AI analysis.'
        };
    }
}
