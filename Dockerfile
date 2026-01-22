FROM node:24-alpine AS builder
RUN corepack enable
WORKDIR /app

ENV DATABASE_URL="postgresql://user:pass@localhost:5432/fakedb"

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build


FROM node:24-alpine AS runner
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/dist ./dist

RUN pnpm install --prod --frozen-lockfile

RUN pnpm add prisma

CMD ["pnpm", "start:prod"]
