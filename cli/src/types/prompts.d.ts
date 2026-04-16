declare module 'prompts' {
    export interface Choice {
        title: string;
        value: any;
        disabled?: boolean;
        selected?: boolean;
        description?: string;
    }

    export interface PromptOptions {
        type: string | ((prev: any, values: any, prompt: any) => string | null);
        name: string | ((prev: any, values: any, prompt: any) => string | null);
        message: string | ((prev: any, values: any, prompt: any) => string | null);
        initial?: any;
        choices?: Choice[];
        validate?: (value: any) => boolean | string | Promise<boolean | string>;
        onState?: (state: any) => void;
        min?: number;
        max?: number;
        float?: boolean;
        round?: number;
        increment?: number;
        separator?: string;
        active?: string;
        inactive?: string;
        multiline?: boolean;
        limit?: number;
        format?: (val: any) => any;
    }

    export default function prompts(options: PromptOptions | PromptOptions[], config?: { onSubmit?: (prompt: any, answer: any, answers: any) => void, onCancel?: (prompt: any, answers: any) => void }): Promise<any>;
}
