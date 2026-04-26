# ── Stage 1: builder ──────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Instalar deps ANTES de copiar src → esta capa se cachea si package*.json no cambia
COPY package*.json ./
RUN npm ci --ignore-scripts

# 2. Copiar configuración TS y fuentes
COPY tsconfig.json tsconfig.prod.json ./
COPY src ./src

# 3. Compilar para producción (sin sourcemaps, sin .d.ts)
RUN npm run build:prod

# ── Stage 2: runner ───────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Usuario sin privilegios
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Instalar solo dependencias de producción
# Esta capa se cachea si package*.json no cambia
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copiar el build compilado desde la etapa anterior
COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 4000

# start-period generoso para Railway cold-start (Railway mide desde que arranca el contenedor)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "dist/index.js"]
