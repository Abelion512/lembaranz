## 2025-05-24 - CWE-732 Insecure File Permissions when saving Config/Backup
## Security Learnings

## File Permission Hardening
To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or `.lembaranz` exported backups. Default permissions (0o666 minus umask) may allow unauthorized local reads from other users on the system.

**Vulnerability:** The application was writing sensitive files (like `.env` environments and `.lembaranz` vault backups) using `fs.writeFile` without explicitly setting the `mode` option. By default, `fs.writeFile` uses `0o666` (rw-rw-rw-) minus the user's `umask`. This means on systems with permissive umasks (e.g. `0022`), the written sensitive files were readable by any user on the local machine (`-rw-r--r--`).

## Testing Mocks with Bun
When mocking Node built-in modules like `child_process` in Bun tests (where functions like `spawn` are imported directly, e.g., `import { spawn } from 'child_process'`), use `mock.module('child_process', () => ({ spawn: mockSpawn }))` instead of `spyOn`.
When writing test assertions for normalized URLs generated via `new URL().href`, note that Node/Bun's URL implementation may automatically append a trailing slash (e.g. `domain.com` becomes `domain.com/`). Test assertions using strict equality must account for this to prevent spurious failures.
## 2026-09-18 - Insecure File and Directory Permissions (CWE-732)
**Vulnerability:** Sensitive files like `.env`, vault files, and directories containing configuration/secrets were being created with default OS permissions, which could be too permissive and allow other local users to access them.
**Learning:** Default `fs.writeFile` and `fs.mkdir` behavior relies on `umask`, which might not be sufficiently restrictive (e.g., 0o022 means 0o644 for files).
**Prevention:** Always explicitly provide `{ mode: 0o600 }` for sensitive files and `{ mode: 0o700 }` for sensitive directories when using `fs` modules.

## 2026-07-27 - [Fix XSS Bypass via Double Encoding in safeMarked]
**Vulnerability:** XSS bypass possible in safeMarked because isDangerousUrl only single-pass decoded URLs, allowing attackers to double URL encode malicious javascript: URIs.
**Learning:** Single-pass decoding is insufficient for security filters. Attackers can layer encodings (like double URL encoding) to bypass regex signatures.
**Prevention:** Security filters that rely on decoding user input to check for malicious signatures must use an iterative decoding loop (e.g., while loop) to recursively unescape all layers of encoding.

## 2026-09-25 - [Insecure File/Directory Permissions]
**Vulnerability:** Files and directories containing sensitive data were created with default permissions, which may allow unauthorized local access.
**Learning:** Default Node.js filesystem APIs do not automatically restrict access.
**Prevention:** Always explicitly set restrictive permissions (`{ mode: 0o600 }` for files, `{ mode: 0o700 }` for directories) when creating files or folders that handle sensitive data to prevent CWE-732.

## 2026-08-03 - Insecure File Permissions Mitigated
**Vulnerability:** Use of `fs.writeFile` to write sensitive data without explicitly setting restrictive file permissions.
**Learning:** Default filesystem permissions may allow unauthorized local read access.
**Prevention:** Always explicitly set restrictive file permissions (e.g., `{ encoding: 'utf8', mode: 0o600 }` or `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or encrypted backups.
## 2024-05-15 - Insecure File Permissions for Sensitive Files
**Vulnerability:** fs.writeFile was writing sensitive files (.env configs and .lembaranz backups) with default permissions (0o666 minus umask), potentially allowing unauthorized local reads (CWE-732).
**Learning:** The codebase lacked a unified secure file writing approach, leading to inconsistent permissions where some modules defaulted to OS defaults for sensitive data.
**Prevention:** Always explicitly set restrictive permissions (e.g., { mode: 0o600 }) when using fs.writeFile for sensitive files.

## 2024-07-25 - Insecure File Permissions
**Vulnerability:** Sensitive files like `.env` and `.lembaranz` backups were written with default permissions, allowing unauthorized local reads.
**Learning:** Default Node.js `fs.writeFile` permissions are 0o666 (minus umask), which does not protect sensitive data from other users on the system.
**Prevention:** Always explicitly set `{ mode: 0o600 }` when writing files that contain secrets or sensitive user data.

## 2024-07-24 - Double Encoding XSS Bypass
**Vulnerability:** The `isDangerousUrl` function in the markdown renderer used a single-pass decoding logic to filter out dangerous URL protocols like `javascript:`. This could be bypassed using multiple layers of encoding, such as double URL-encoding.
**Learning:** Security filters that rely on decoding user input to check for malicious signatures must recursively unescape all layers of encoding (e.g. double URL encoding). Single-pass decoding is insufficient.
**Prevention:** Use an iterative decoding loop to recursively unescape all layers of encoding until the string stabilizes (with a max depth to avoid DoS).

## 2026-07-23 - [Insecure File Permissions / CWE-732]
**Vulnerability:** Found multiple instances where sensitive files (`.env` files containing API keys and exported `.lembaranz` encrypted vault backups) were written to disk using `fs.writeFile` without specifying strict file permissions (mode). This results in the files being created with default permissions (often `0o666` minus umask), which may allow unauthorized local users or processes to read sensitive secrets (CWE-732).
**Learning:** In Node.js, `fs.writeFile` defaults to mode `0o666` when creating new files. The developers failed to recognize that local environment and backup files hold critical credentials and must be restricted immediately upon creation.
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` or similar file-creation APIs for sensitive files to ensure only the owner can read/write them.
## 2024-07-22 - [Insecure File Permissions for Sensitive Files]
**Vulnerability:** Several places in the codebase use `fs.writeFile` to write sensitive files like `.env` configurations and `.lembaranz` backups without specifying file permissions.
**Learning:** Default permissions for file creation without `mode` can be insecure (often 0o666 minus umask), potentially allowing unauthorized local read access to sensitive data (CWE-732).
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files.

## 2024-05-18 - XSS evasion via double-encoding in Markdown parser
**Vulnerability:** The `isDangerousUrl` function in `safeMarked.ts` only performed a single pass of URI and HTML entity decoding when checking for malicious protocols (e.g., `javascript:`).
**Learning:** This allowed an attacker to bypass the security check by double-encoding the malicious payload (e.g., `%256A%2561%2576%2561%2573%2563%2572%2569%2570%2574%253Aalert(1)`), which would only be partially decoded by the single pass, evading the check, but still executed by the browser.
**Prevention:** Always use an iterative decoding loop (e.g., up to 5 times) to recursively unescape all layers of encoding until the string stops changing, ensuring that deeply nested encodings are fully neutralized before validation.
## 2024-07-20 - Fix Insecure File Permissions for Sensitive Files
**Vulnerability:** fs.writeFile was used to write sensitive files like .env and .lembaranz backups without restrictive file permissions.
**Learning:** Default permissions on created files (e.g. 0o666 minus umask) may allow unauthorized local reads by other users on the system.
**Prevention:** Always explicitly set restrictive permissions (e.g., { mode: 0o600 }) when using fs.writeFile for sensitive files.
## 2026-07-19 - Fix Insecure File Permissions (CWE-732)
**Vulnerability:** Found insecure default file permissions when writing sensitive files like .env or .lembaranz backups, leading to CWE-732.
**Learning:** Default fs.writeFile permissions (0o666 minus umask) can allow unauthorized local users to read sensitive credentials and database files.
**Prevention:** Always explicitly set { mode: 0o600 } for sensitive file writes using fs.writeFile.

## 2024-05-24 - Fix Insecure File Permissions in File Creation (CWE-732)
**Vulnerability:** Calls to `fs.writeFile` in `Context.ts`, `Config.ts`, and `TerminalUI.ts` created sensitive files (like `.env` and `.lembaranz` backup files) without explicitly setting file permissions, leading to files being created with default permissions (often `0o666` minus umask) which can allow unauthorized local users to read sensitive credentials and configurations.
**Learning:** Default file creation permissions in Node.js are determined by the system umask. For files containing sensitive information, relying on the system default is insecure as it may inadvertently grant read access to other local users.
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or `.lembaranz` encrypted backups, ensuring only the owner can read/write them.

## 2024-04-18 - [Insecure File Permissions (CWE-732) on Sensitive Exports]
**Vulnerability:** `fs.writeFile` was used without explicit modes for sensitive files (`.env` and `.lembaranz` backup exports), allowing default permissions (0o666 minus umask) which risks local unauthorized read access.
**Learning:** Default Node.js file system APIs do not assume security. When exporting credentials or encrypted backup vaults, explicit `0o600` modes must be enforced consistently across all CLI/TUI and core modules.
**Prevention:** Always pass `{ mode: 0o600 }` (or similar restrictive modes) in the options object when calling `fs.writeFile` for any file containing secrets or PII.

## 2025-02-09 - [Preventing Double-Encoded XSS Bypasses]
**Vulnerability:** XSS filters using single-pass decoding can be bypassed by double URL encoding or mixed encoding (e.g., HTML entities inside URL encoding).
**Learning:** Attackers encode malicious payloads multiple times because the browser may perform recursive decoding natively, while naive filters only decode once and fail to match the signature.
**Prevention:** Use an iterative loop (e.g., up to 5 times) to repeatedly decode and unescape input until it stabilizes before validating for dangerous schemes like `javascript:`.

## 2024-07-17 - Insecure File Permissions for Secrets (CWE-732)
**Vulnerability:** The application writes highly sensitive files (e.g., `.env` configuration files and `.lembaranz` encrypted vault backups) using `fs.writeFile` without explicitly specifying permissions. This falls back to the process umask, which can default to insecure permissions like 0o644, allowing other users on the local machine to read the files.
**Learning:** Even encrypted data or dynamically injected local environments represent sensitive attack surfaces. Failing to harden the filesystem layer compromises the defense-in-depth model, exposing secrets to lateral movement.
**Prevention:** To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for sensitive files like `.env` configurations or `.lembaranz` backups to ensure they are readable and writable only by the owner.
## 2025-02-27 - Insecure File Permissions for .env and exported files
**Vulnerability:** fs.writeFile defaults to 0o666 permissions allowing local read access to sensitive .env configurations and encrypted backups.
**Learning:** Default node.js fs permissions are not restrictive enough for sensitive data.
**Prevention:** Always explicitly set `{ mode: 0o600 }` when writing files that contain sensitive secrets or environment variables.
## 2024-05-24 - Insecure File Permissions on Sensitive Files
**Vulnerability:** Default file permissions were used when creating .env files and encrypted backups.
**Learning:** Node.js fs.writeFile defaults to 0o666 (minus umask), exposing sensitive data to other local system users.
**Prevention:** Always explicitly set restrictive permissions (e.g., { mode: 0o600 }) for sensitive files.

## 2025-01-01 - Fix Insecure File Permissions for Sensitive Files
**Vulnerability:** Sensitive files like `.env` configurations and `.lembaranz` backups were written to disk using `fs.writeFile` without explicit file permissions, relying on the default umask which could allow unauthorized local read access.
**Learning:** Default file creation permissions do not guarantee confidentiality for sensitive data on multi-user systems.
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) in the options object when writing sensitive files.

## 2024-07-10 - Insecure File Permissions for Sensitive Configurations
**Vulnerability:** File writes for `.env` and `.lembaranz` backup files were missing explicit mode configuration, leaving them exposed to local unauthorized reads (CWE-732).
**Learning:** Using `fs.writeFile` with default permissions uses `0o666` (minus umask), which provides read access to all local users.
**Prevention:** Always specify `{ mode: 0o600 }` when writing credentials or database files.
## 2026-07-09 - Fix CWE-732 Insecure File Permissions for Sensitive Files
**Vulnerability:** Found `fs.writeFile` calls creating `.env` and `.lembaranz` backup files with default file permissions (0o666 minus umask), exposing them to unauthorized local reads.
**Learning:** Default Node.js `fs.writeFile` behavior is insecure for sensitive files in a multi-user environment. Explicit file permission sets must be applied to prevent local data exposure.
**Prevention:** Always explicitly define `{ mode: 0o600 }` in the options object of `fs.writeFile` when writing secrets, configurations, or encrypted backups.
## 2026-07-08 - [CRITICAL] Fix Insecure File Permissions
**Vulnerability:** Sensitive files (.env and .lembaranz) were written using default file permissions (CWE-732).
**Learning:** When using fs.writeFile without explicit modes, default umask permissions allow unauthorized local reads.
**Prevention:** Always explicitly set restrictive permissions (e.g., { mode: 0o600 }) when writing sensitive configuration or backup files.

## 2024-07-05 - Fix insecure file permissions on export
**Vulnerability:** Exported backup files were written with default permissions, potentially allowing unauthorized local reads.
**Learning:** Sensitive files must explicitly define restrictive permissions when written to disk to prevent CWE-732 (Insecure File Permissions).
**Prevention:** Always include `{ mode: 0o600 }` in `fs.writeFile` options when writing sensitive data like .env or .lembaranz backups.
## 2024-07-06 - XSS Double Encoding Bypass in safeMarked

**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `packages/dashboard/lib/safeMarked.ts` where malicious URLs like `%256A%2561%2576%2561%2573%2563%2572%2569%2570%2574%253Aalert(1)` could bypass the protocol filtering logic.
**Learning:** The `isDangerousUrl` function only decoded URLs once. Attackers could evade the `javascript:` check by double-encoding the URI components (e.g. `%256A` -> `%6A` -> `j`).
**Prevention:** Implement an iterative decoding loop that runs until the decoded output no longer changes (bounded to a max number of iterations like 5 to prevent DoS) before applying protocol denylists or regex tests.

## 2025-07-07 - [File Permissions (CWE-732)]
**Vulnerability:** Sensitive files like `.env` and backups were written using default file permissions, exposing them to other users on the system (CWE-732).
**Learning:** Always provide `{ mode: 0o600 }` to `fs.writeFile` when saving sensitive information.
**Prevention:** Use restrictive permissions explicitly when writing credential or configuration files.

## 2026-06-26 - Insecure File Permissions in Data Writing
**Vulnerability:** Found `fs.writeFile` being used without explicit restrictive file permissions for sensitive `.env` configurations and encrypted vault backups in `Context.ts`, `Config.ts`, and `TerminalUI.ts`.
**Learning:** Default file creation permissions (`0o666` modified by the system umask) are typically too permissive (`0o644` or `0o664`) for sensitive secrets or configuration files, potentially allowing unauthorized local users to read them.
**Prevention:** Always explicitly set restrictive file permissions, such as `{ mode: 0o600 }`, when writing sensitive data files using `fs.writeFile` or similar filesystem APIs to prevent CWE-732 vulnerabilities.

## 2024-06-25 - Prevent Command Injection via exec()
**Vulnerability:** The `packages/cli/src/commands/Dashboard.ts` command used `exec(cmd)` to execute a local dashboard development server using string interpolation. User-supplied arguments like `--host` and `--port` were interpolated directly into the `cmd` string, allowing for command injection if a malicious user executed the command with manipulated options.
**Learning:** Node's `child_process.exec()` spawns a shell and runs commands within it, making it inherently vulnerable to command injection if arguments are not sanitized.
**Prevention:** Always use `child_process.spawn()` with `shell: false` (the default) and pass arguments as an array rather than interpolating them into a single command string. This guarantees that arguments are passed safely directly to the executable rather than being parsed by a shell.

## Cross-Platform Command Execution without Shell
When enforcing `shell: false` in `child_process.spawn` to prevent command injection, executable commands (like `bun`, `npm`, `yarn`) may throw `ENOENT` on Windows. This is because these commands are often `.cmd` or `.bat` scripts on Windows, which require a shell to execute. To mitigate this securely without reverting to `shell: true`, dynamically resolve the executable name based on the OS (e.g., `os.platform() === 'win32' ? 'bun.cmd' : 'bun'`).

## 2024-06-21 - CWE-732: Insecure Default File Permissions for Sensitive Data
**Vulnerability:** Calling `fs.writeFile` without explicit secure `mode` arguments resulted in sensitive files (e.g., local `.env` configurations and encrypted `.lembaranz` backup exports) being created with default permissions (typically `0o666` minus umask), potentially allowing unauthorized local system users to read sensitive contents.
**Learning:** Node.js file system APIs like `fs.writeFile` do not default to restrictive permissions. When writing files that contain credentials or cryptographic backups, developers must explicitly override the default OS umask logic to restrict read/write access.
**Prevention:** Always enforce strict file permission arguments (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` or `fs.writeFileSync` to create files containing sensitive data.

## 2024-10-27 - [Insecure File Permissions]
**Vulnerability:** Missing explicit secure permissions when writing sensitive files like `.env` and `.lembaranz` backups via `fs.writeFile` (CWE-732).
**Learning:** Default Node.js `fs.writeFile` permissions are usually `0o666` modified by the process umask, which can allow unauthorized local users to read sensitive credentials.
**Prevention:** Always explicitly define restrictive file permissions (e.g., `{ mode: 0o600 }`) in the options object when writing sensitive files to disk.
## 2026-08-07 - Enforce Secure File and Directory Permissions
**Vulnerability:** Files containing sensitive data (e.g. .env, logs) and vault directories were created with permissive default permissions.
**Learning:** Relying on default fs.mkdir and fs.writeFile permissions can expose secure data to other local users. Permissions must be explicitly set to restrict access to the current user.
**Prevention:** Always use { mode: 0o700 } for directories and { mode: 0o600 } for files when interacting with the filesystem API for sensitive data.

## File System Write Permissions (CWE-732) Mitigation
To prevent CWE-732 (Insecure File Permissions), always explicitly set restrictive permissions when using `fs.writeFile` for sensitive files like `.env` configurations or `.lembaranz` encrypted backups. Default permissions (0o666 minus umask) may allow unauthorized local reads. Use `{ encoding: 'utf8', mode: 0o600 }` or `{ mode: 0o600 }`.

## 2024-06-25 - CWE-732 Insecure File Permissions for Sensitive Files
**Vulnerability:** Use of `fs.writeFile` to write sensitive files (like `.env` and backups) without explicitly providing restrictive file modes, causing them to use default, potentially insecure permissions (e.g. `0o666`).
**Learning:** Default permissions might allow unauthorized local reads by other users on a multi-user system.
**Prevention:** To prevent CWE-732, explicitly set restrictive permissions `mode: 0o600` when calling `fs.writeFile` for credentials, environments configurations, and vault exports.
## 2024-05-18 - Prevent CWE-732 Insecure File Permissions in `fs.writeFile`
**Vulnerability:** Files written with `fs.writeFile` without explicit permissions will use the system's default permissions (usually `0o666` modified by the umask), which might allow unauthorized local users to read sensitive files.
**Learning:** `fs.writeFile` allows you to pass an options object as the third argument to set explicitly restrictive permissions such as `0o600`.
**Prevention:** Always use `{ mode: 0o600 }` when calling `fs.writeFile` to write sensitive data or configuration files like `.env` profiles or `.lembaranz` encrypted backup files.

## 2026-06-22 - [Insecure File Permissions (CWE-732) Mitigation]
**Vulnerability:** Found multiple instances where sensitive files (like `.env` and `.lembaranz` encrypted backup exports) were created using `fs.writeFile` without explicit permission boundaries.
**Learning:** In Node.js, `fs.writeFile` defaults to `0o666` (read/write for everyone) modified by the user's `umask`. If a user's `umask` is overly permissive (e.g., `000` or `002`), sensitive files on the filesystem could be read or modified by other local users, posing a critical data leak risk for credentials and secrets.
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using file writing APIs for sensitive configuration and backup files to ensure they are strictly limited to the file owner.
**Learning:** When handling secrets or writing cryptographic database states to the local filesystem using standard Node.js libraries, we cannot rely on the user's default `umask` to restrict file access. We must defensively enforce `mode: 0o600` on the file descriptor directly.

**Prevention:** Ensure that all file writes for sensitive configuration and backup/vault files explicitly include the `{ mode: 0o600 }` parameter in the `fs.writeFile` arguments to guarantee only the owner has read and write capabilities.

## 2025-05-24 - CWE-732 Insecure File Permissions when saving Config/Backup

**Vulnerability:** The application was writing sensitive files (like `.env` environments and `.lembaranz` vault backups) using `fs.writeFile` without explicitly setting the `mode` option. By default, `fs.writeFile` uses `0o666` (rw-rw-rw-) minus the user's `umask`. This means on systems with permissive umasks (e.g. `0022`), the written sensitive files were readable by any user on the local machine (`-rw-r--r--`).

**Learning:** When handling secrets or writing cryptographic database states to the local filesystem using standard Node.js libraries, we cannot rely on the user's default `umask` to restrict file access. We must defensively enforce `mode: 0o600` on the file descriptor directly.

**Prevention:** Ensure that all file writes for sensitive configuration and backup/vault files explicitly include the `{ mode: 0o600 }` parameter in the `fs.writeFile` arguments to guarantee only the owner has read and write capabilities.

## 2025-05-24 - CWE-732 Insecure File Permissions when saving Config/Backup

**Vulnerability:** The application was writing sensitive files (like `.env` environments and `.lembaranz` vault backups) using `fs.writeFile` without explicitly setting the `mode` option. By default, `fs.writeFile` uses `0o666` (rw-rw-rw-) minus the user's `umask`. This means on systems with permissive umasks (e.g. `0022`), the written sensitive files were readable by any user on the local machine (`-rw-r--r--`).

**Learning:** When handling secrets or writing cryptographic database states to the local filesystem using standard Node.js libraries, we cannot rely on the user's default `umask` to restrict file access. We must defensively enforce `mode: 0o600` on the file descriptor directly.

**Prevention:** Ensure that all file writes for sensitive configuration and backup/vault files explicitly include the `{ mode: 0o600 }` parameter in the `fs.writeFile` arguments to guarantee only the owner has read and write capabilities.

## 2024-05-18 - [HIGH] Fix Insecure File Permissions (CWE-732)
**Vulnerability:** The application was using `fs.writeFile` without explicitly setting restrictive file permissions when saving sensitive files such as `.env` configurations and `.lembaranz` vault backups. This defaults to 0o666 (minus umask), which may allow unauthorized local users to read sensitive credentials on multi-user systems.
**Learning:** Even though encryption handles data rest security, plain text keys, environment variables, and local data files must be protected at the file-system level. The lack of explicit modes during file writes exposes sensitive data to CWE-732 (Insecure File Permissions).
**Prevention:** Always explicitly set restrictive permissions (e.g., `{ mode: 0o600 }`) when using `fs.writeFile` for any file containing sensitive configuration, backups, or credentials.

## 2024-05-20 - Insecure File Permissions for Sensitive Data (CWE-732)
**Vulnerability:** Calls to `fs.writeFile` for sensitive files like `.env` configurations and `.lembaranz` encrypted backups were missing explicit file mode permissions, potentially defaulting to `0o666` (minus umask), which allows unauthorized local read access.
**Learning:** Default Node.js filesystem permissions can expose sensitive cryptographic and configuration files to local privilege escalation vectors or unauthorized users on multi-tenant environments.
**Prevention:** Always explicitly define restrictive file permissions `(e.g., { mode: 0o600 })` when writing any sensitive material (secrets, config, keys, backups) using `fs.writeFile`.

## 2024-05-18 - Insecure File Permissions
**Vulnerability:** fs.writeFile was used to create sensitive files (.env and backups) without restrictive permissions.
**Learning:** Default permissions (e.g. 0o666 minus umask) can expose sensitive files to unauthorized local users, leading to credential theft.
**Prevention:** Always explicitly set restrictive permissions (e.g., { mode: 0o600 }) when creating sensitive files.

## 2025-02-24 - Fix insecure file permissions on sensitive files
**Vulnerability:** Default Node.js `fs.writeFile` permissions allow potentially broad read access to sensitive `.env` and `.lembaranz` backup files on shared systems.
**Learning:** When using Node.js filesystem modules to write sensitive content like credentials, the default permissions (0o666 minus umask) may be too permissive, violating the principle of least privilege.
**Prevention:** Always explicitly set restrictive file permissions (e.g., `{ mode: 0o600 }`) when creating or modifying files containing secrets or encrypted backups to ensure only the owner can read or write them.

## 2025-02-27 - Secure File Permissions
**Vulnerability:** Sensitive files like `.env` configs and `.lembaranz` backup archives were written using `fs.writeFile` with default permissions (`0o666`).
**Learning:** Default Node.js filesystem permissions can expose sensitive material to other unauthorized local users on a multi-user system (CWE-732).
**Prevention:** Always explicitly define `{ mode: 0o600 }` alongside the encoding when writing critical material to disk.

## 2024-06-13 - Insecure File Permissions for Exported Secrets

**Vulnerability:** The CLI and Core packages were writing sensitive data (like exported environments, encrypted archives, and `.env` files) to disk using default filesystem permissions (typically `0o666` modified by umask). This allowed unauthorized local users to read the exported files or local configuration files.
**Learning:** Hardcoded default permissions in Node.js `fs.writeFile` lead to Local File Inclusion or unauthorized secret exposure in multi-user environments. Explicit restrictive modes are necessary when handling credentials or cryptographic exports.
**Prevention:** Always define explicit file permissions (e.g., `{ mode: 0o600 }`) in `fs.writeFile` calls when outputting any sensitive data, especially for environment variables, credentials, or backups.

## 2025-06-23 - [HIGH] Fix XSS Bypass in safeMarked via Double Encoding
**Vulnerability:** The Markdown `isDangerousUrl` check was vulnerable to XSS bypass via double-encoded URLs (e.g., `%256A%2561...` for `javascript:`).
**Learning:** Single-pass URL decoding is insufficient for security filters because browsers will often recursively decode or handle double-encoded payloads in certain contexts. Attackers can bypass naive regex checks by adding multiple layers of encoding.
**Prevention:** Always use an iterative decoding loop (e.g., `for (let i = 0; i < 5; i++) { ... }`) to unescape all layers of URL/HTML encoding before evaluating a string against security blocklists.

## 2024-06-30 - Fix XSS bypass via double-encoded URLs in markdown
**Vulnerability:** The `isDangerousUrl` function in `safeMarked.ts` used a single-pass decoding approach (only once) for URLs when filtering for dangerous protocols like `javascript:`. Attackers could bypass this by double-encoding malicious URLs (e.g. `%256Aavascript:`).
**Learning:** Security filters that rely on decoding user input to check for malicious signatures must recursively unescape all layers of encoding (e.g. up to a limit like 5 loops). Single-pass decoding is insufficient and allows evasion techniques like double encoding or mixed encoding. Also initializing the decoded fallback (`let decoded = url;`) avoids potential issues if decodeURIComponent throws on malformed URIs.
**Prevention:** Always use an iterative decoding loop (up to a fixed number of iterations to prevent DoS) when validating inputs against malicious signatures. Ensure error fallbacks provide a baseline safe value (e.g. initialing with the original string) rather than returning undefined or skipping validation.

## 2026-07-01 - [Double-Encoding XSS Bypass in Markdown Sanitizer]
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability existed in the `isDangerousUrl` function in `safeMarked.ts` where a malicious user could bypass the URL protocol filter (e.g., `javascript:`) by double URL encoding or using mixed HTML/URL encoding.
**Learning:** Single-pass URL decoding is insufficient for security filters because attackers can layer encodings (like `%256A` or `&#x25;6A`) that resolve to dangerous payloads after the initial pass.
**Prevention:** Always use an iterative decoding loop that recursively unescapes all layers of encoding (e.g., up to 5 loops) until the string stabilizes, ensuring no deeply embedded malicious signatures bypass the filter.

## 2025-02-27 - Double/Multiple Encoding XSS Bypass
**Vulnerability:** The Markdown rendering function `isDangerousUrl` iteratively checked decoded URLs to sanitize XSS, but it previously decoded it only once. This allowed double encoded URIs (`%256A%2561...` which decodes to `%6A%61...` which then decodes to `javascript:...`) or multiple encodings to bypass the filter.
**Learning:** Security filters that rely on decoding user input to check for malicious signatures must use an iterative decoding loop to recursively unescape all layers of encoding.
**Prevention:** Implement a recursive or iterative decoding limit (e.g. up to 5 times or until decoding no longer changes the string) to prevent multiple encoded injections.

## 2024-07-02 - Insecure File Permissions in Environment and Export Files
**Vulnerability:** Insecure file permissions (CWE-732). Files like `.env` and `lembaranz-petikan-*.lembaranz` were being written using default permissions (0o666 minus umask), potentially allowing unauthorized local read access.
**Learning:** Default `fs.writeFile` permissions in Node.js/Bun are unsafe for sensitive files if a restrictive umask is not set.
**Prevention:** Always explicitly set `{ mode: 0o600 }` (or similar restrictive modes) when using `fs.writeFile` or similar APIs for sensitive data.
