# syntax=docker/dockerfile:1
FROM oven/bun:1 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/web/package.json packages/web/package.json
COPY packages/core/package.json packages/core/package.json
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/core/src ./packages/core/src
COPY packages/core/package.json ./packages/core/package.json
COPY packages/web ./packages/web
RUN cd packages/web && bun run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user (Debian-based, not Alpine)
RUN groupadd -r nodejs && useradd -r -g nodejs -u 1001 nextjs

COPY --from=builder /app/packages/web/public ./packages/web/public
COPY --from=builder /app/packages/web/.next/standalone ./
COPY --from=builder /app/packages/web/.next/static ./packages/web/.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 1400
ENV PORT=1400
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "packages/web/server.js"]
