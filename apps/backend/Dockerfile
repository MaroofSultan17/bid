FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/core/db/migrations ./dist/core/db/migrations
COPY --from=builder /app/src/core/db/seeds ./dist/core/db/seeds

EXPOSE 3001
CMD ["npm", "run", "start"]