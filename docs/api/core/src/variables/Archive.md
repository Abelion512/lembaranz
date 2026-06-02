[**Lembaranz Documentation v0.0.0**](../../../README.md)

***

[Lembaranz Documentation](../../../modules.md) / [core/src](../README.md) / Archive

# Variable: Archive

> `const` **Archive**: `object`

Defined in: [packages/core/src/Archive.ts:27](https://github.com/Abelion512/lembaranz/blob/8b1dfa5f3130b9a0eab727dc0ef6d34fab9cd167/packages/core/src/Archive.ts#L27)

Archive: Core module for vault management and entry lifecycle.
Handles encryption, storage, recovery, and data integrity.

## Type Declaration

### decryptNote()

> **decryptNote**(`note`, `requesterId?`): `Promise`\<`Result`\<[`DecryptedNote`](../interfaces/DecryptedNote.md)\>\>

Fully decrypts a single entry including content and credentials.
Supports optional Agent Access Control enforcement.

#### Parameters

##### note

[`StoredNote`](../interfaces/StoredNote.md)

##### requesterId?

`string`

#### Returns

`Promise`\<`Result`\<[`DecryptedNote`](../interfaces/DecryptedNote.md)\>\>

### deleteNote()

> **deleteNote**(`id`): `Promise`\<`void`\>

Deletes an entry by ID.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

### destroyAllData()

> **destroyAllData**(): `Promise`\<`void`\>

Permanently destroys all local application data.

#### Returns

`Promise`\<`void`\>

### getAllNotes()

> **getAllNotes**(): `Promise`\<`Result`\<[`DecryptedNote`](../interfaces/DecryptedNote.md)[]\>\>

Retrieves all entries with decrypted titles and previews.
Full content remains encrypted for security.

#### Returns

`Promise`\<`Result`\<[`DecryptedNote`](../interfaces/DecryptedNote.md)[]\>\>

### getNoteById()

> **getNoteById**(`id`): `Promise`\<`Result`\<[`Note`](../type-aliases/Note.md) \| `undefined`\>\>

Retrieves and decrypts a specific entry by ID.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`Result`\<[`Note`](../type-aliases/Note.md) \| `undefined`\>\>

### getStats()

> **getStats**(): `Promise`\<\{ `folders`: `number`; `notes`: `number`; \}\>

Retrieves statistics (entry and folder counts).

#### Returns

`Promise`\<\{ `folders`: `number`; `notes`: `number`; \}\>

### isVaultInitialized()

> **isVaultInitialized**(): `Promise`\<`Result`\<`boolean`\>\>

Checks if the authentication metadata is initialized in storage.

#### Returns

`Promise`\<`Result`\<`boolean`\>\>

### isVaultSetup()

> **isVaultSetup**(): `Promise`\<`boolean`\>

Checks if the vault base configuration (salt) is present.

#### Returns

`Promise`\<`boolean`\>

### recoverVault()

> **recoverVault**(`mnemonic`): `Promise`\<`Result`\<`boolean`\>\>

Recovers vault access using a paper key (mnemonic).

#### Parameters

##### mnemonic

`string`

#### Returns

`Promise`\<`Result`\<`boolean`\>\>

### resetPassword()

> **resetPassword**(`newPassword`): `Promise`\<`Result`\<`void`\>\>

Updates the master password for the currently open vault.

#### Parameters

##### newPassword

`string`

#### Returns

`Promise`\<`Result`\<`void`\>\>

### restoreBackup()

> **restoreBackup**(`buffer`, `passwordBackup`): `Promise`\<`Result`\<\{ `restored`: `number`; `skipped`: `number`; \}\>\>

Restores data from a portable backup buffer.

#### Parameters

##### buffer

`Uint8Array`

##### passwordBackup

`string`

#### Returns

`Promise`\<`Result`\<\{ `restored`: `number`; `skipped`: `number`; \}\>\>

### saveNote()

> **saveNote**(`note`): `Promise`\<`Result`\<[`StoredNote`](../interfaces/StoredNote.md)\>\>

Saves a new entry or updates an existing one.
Encrypts all sensitive fields before storage.

#### Parameters

##### note

[`NoteInput`](../interfaces/NoteInput.md)

#### Returns

`Promise`\<`Result`\<[`StoredNote`](../interfaces/StoredNote.md)\>\>

### setupVault()

> **setupVault**(`password`, `mnemonic?`): `Promise`\<`Result`\<`void`\>\>

Initializes a new vault with a password and optional recovery mnemonic.

#### Parameters

##### password

`string`

Master password

##### mnemonic?

`string`

12-word recovery mnemonic (optional)

#### Returns

`Promise`\<`Result`\<`void`\>\>

### unlockVault()

> **unlockVault**(`password`): `Promise`\<`Result`\<`boolean`\>\>

Unlocks the vault using a password.
Handles automatic migration from V2 (Legacy) to V3 (Decoupled).

#### Parameters

##### password

`string`

#### Returns

`Promise`\<`Result`\<`boolean`\>\>
