# Multi-stage build for optimized backend production image
# Phase 11: Performance, DevOps & Deployment

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files only (better layer caching)
COPY package*.json ./
RUN npm ci --include=dev && npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 3: Production dependencies
FROM node:20-alpine AS prod-deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Stage 4: Production
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist

# Copy Prisma files
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client
RUN npx prisma generate

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# Expose port
EXPOSE 5555

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5555/api/metadata || exit 1

# Add labels
LABEL org.opencontainers.image.source="https://github.com/gramps-project/gramps-web"
LABEL org.opencontainers.image.description="Gramps Web Backend - Optimized Production Image"
LABEL org.opencontainers.image.version="1.0.0"

CMD ["npm", "run", "start:prod"]

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5555

CMD ["npm", "run", "start:dev"]
