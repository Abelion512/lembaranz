# 🛡️ Sentinel Learnings

## Hardcoded Credentials in Scripts
Even in benchmarking or temporary testing scripts, hardcoded passwords violate fundamental secret management practices. They can accidentally leak into CI outputs or get mistakenly imported into production code.

**Fix Pattern:**
Instead of falling back to default hardcoded strings or auto-generating a random string when an environment variable is missing, explicitly failing fast by throwing an error (`if (!password) throw new Error(...)`) enforces correct, conscious usage of secrets by the operator and ensures cross-script consistency (e.g. creating a vault with one script and reading it with another using the exact same password).
