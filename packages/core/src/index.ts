/**
 * Public API barrel for `@lembaranz/core`.
 *
 * Consumers import from the package root, never from deep paths, so this file
 * is the contract. Add a re-export here when adding a module, and keep the
 * browser bundle free of Node built-ins: anything that touches `fs` is reached
 * through a dynamic import or the `FileAdapter` shim.
 */
export * from './Archive';
export * from './AuditLog';
export * from './Audit';
export * from './Vault';
export * from './Storage';
export * from './Integrity';
export * from './Password';
export * from './Context';
export * from './Sentinel';
export * from './Formula';
export * from './Senses';
export * from './storage/FileAdapter';
export * from './storage/BrowserAdapter';
export * from './storage/types';
