## 2025-05-24 - CWE-732 Insecure File Permissions when saving Config/Backup

**Vulnerability:** The application was writing sensitive files (like `.env` environments and `.lembaranz` vault backups) using `fs.writeFile` without explicitly setting the `mode` option. By default, `fs.writeFile` uses `0o666` (rw-rw-rw-) minus the user's `umask`. This means on systems with permissive umasks (e.g. `0022`), the written sensitive files were readable by any user on the local machine (`-rw-r--r--`).

**Learning:** When handling secrets or writing cryptographic database states to the local filesystem using standard Node.js libraries, we cannot rely on the user's default `umask` to restrict file access. We must defensively enforce `mode: 0o600` on the file descriptor directly.

**Prevention:** Ensure that all file writes for sensitive configuration and backup/vault files explicitly include the `{ mode: 0o600 }` parameter in the `fs.writeFile` arguments to guarantee only the owner has read and write capabilities.
