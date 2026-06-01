🔒 fix: prevent OS command injection via URL parsing in reporter

🎯 What:
The `openReport` function in `packages/cli/src/tui/reporter.ts` previously accepted an unsanitized URL string and passed it directly to native OS openers (`open`, `explorer`, `xdg-open`) via `child_process.spawn`. This PR updates the logic to parse the input strictly via `new URL()` and filters out any protocols that are not explicitly `http:` or `https:`. The normalized `href` is now used to invoke the system opener.

⚠️ Risk:
Although `spawn` was executed with `shell: false`, passing unsanitized and unvalidated URLs left the client vulnerable to executing dangerous protocols (e.g., `file://`, `ms-msdt://`, etc.). An attacker crafting a malicious payload could abuse the underlying shell opener on the user's OS to achieve arbitrary file access or command execution on the host machine.

🛡️ Solution:
1. Wrap the URL parameter parsing in a `new URL()` block enclosed in a `try...catch`. Invalid URLs will silently fail.
2. Ensure `parsedUrl.protocol` is exactly `http:` or `https:`.
3. Pass `parsedUrl.href` to `spawn`, ensuring a fully normalized string that limits bypass vectors.
4. Added test coverage in `packages/cli/src/tui/__tests__/reporter.test.ts`, mocking `child_process.spawn` to ensure no native system openers are inadvertently triggered during test execution while safely handling URLs.
