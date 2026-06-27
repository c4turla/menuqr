# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Env vars saat build — pakai placeholder agar Next.js tidak crash saat prerender
# Nilai sesungguhnya diset di runtime via docker-compose / EasyPanel
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV BETTER_AUTH_SECRET="placeholder-secret-for-build-only-32chars!!"
ENV BETTER_AUTH_URL="http://localhost:3000"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Stage 3: Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy drizzle migrations (dibutuhkan oleh start.sh untuk jalankan migrate)
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy startup script
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x ./start.sh

# Copy Next.js standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Buat direktori uploads dan beri permission
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads
RUN chown nextjs:nodejs ./start.sh
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Jalankan migrasi terlebih dahulu, lalu start app
CMD ["sh", "./start.sh"]
