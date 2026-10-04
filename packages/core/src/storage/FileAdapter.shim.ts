/**
 * Browser build substitute for `FileAdapter`.
 *
 * Bundlers resolve the `.shim` variant in web builds so `fs` never enters the
 * browser bundle. Construction always throws: if this is reached at runtime,
 * the bundle picked the wrong file.
 */
export class FileAdapter {
    constructor() {
        throw new Error('FileAdapter is not available in the browser.');
    }
}
