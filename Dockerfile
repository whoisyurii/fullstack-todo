# Multi-stage Dockerfile for Full-Stack Todo App

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend  
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Stage 3: Production
FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm ci --production
COPY --from=backend-builder /app/backend/dist ./dist

# Copy frontend build (standalone Next.js)
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Create data directory for SQLite
RUN mkdir -p /data

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_PATH=/data/todos.db
ENV FRONTEND_PATH=/app/frontend

CMD ["node", "dist/server.js"]
