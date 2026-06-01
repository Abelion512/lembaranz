# ═══════════════════════════════════════════════════════════
# 🐳 LEMBARANZ DOCKERFILE (CLI ONLY)
# ═══════════════════════════════════════════════════════════
FROM oven/bun:latest
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN bun install

# Start the CLI
CMD ["bun", "run", "cli", "mulai"]
