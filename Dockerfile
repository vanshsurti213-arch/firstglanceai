# ==============================================================================
# FirstGlance AI - Multi-Stage Production Containerfile
# ==============================================================================

# --- Stage 1: Build & Graph Optimizer ---
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY . .
RUN npm run build

# --- Stage 2: Production Distroless / Hardened Runtime ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Create unprivileged service user
RUN groupadd -r fgapp && useradd -r -g fgapp -d /app fgapp

# Copy runtime assets
COPY --from=builder /app /app

# Expose HTTP gateway port
EXPOSE 8080

# Healthcheck probe pointing to readiness endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('node:http').get('http://localhost:8080/health/ready', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

USER fgapp

CMD ["node", "src/server.js"]
