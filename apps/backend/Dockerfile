# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner Stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/core/db/migrations ./dist/core/db/migrations
COPY --from=builder /app/seed.sql ./dist/seed.sql

EXPOSE 3001
CMD ["node", "dist/server.js"]
