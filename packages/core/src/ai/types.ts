export interface PoetPlan {
    decision: string;
    reason: string;
    system_command: string | null;
    internal_note: string;
}

export interface PoetProvider {
    id: string;
    name: string;
    think(context: string, instruction: string): Promise<PoetPlan>;
}
