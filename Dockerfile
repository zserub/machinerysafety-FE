FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install CA certificates for HTTPS (needed for Paraglide CDN plugins)
RUN apk add --no-cache ca-certificates

ARG VERSION=dev
ARG VITE_LOG_LEVEL=info

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and build with version and env vars
COPY . .
ENV VITE_VERSION=${VERSION}
ENV VITE_LOG_LEVEL=${VITE_LOG_LEVEL}
RUN bunx svelte-kit sync && bun run build

# Production image
FROM oven/bun:1-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

# Install production dependencies only
RUN bun install --production --frozen-lockfile

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["bun", "./build/index.js"]
