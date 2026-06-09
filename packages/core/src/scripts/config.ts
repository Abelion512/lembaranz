export function getBenchPassword(): string {
    const password = process.env.BENCH_PASSWORD;
    if (!password) {
        throw new Error(
            'BENCH_PASSWORD environment variable is not set.\n' +
            'Please run the script with a password, for example:\n' +
            'BENCH_PASSWORD=your_secure_password bun run bench-archive.ts'
        );
    }
    return password;
}
