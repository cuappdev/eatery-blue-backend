# Use Node.js 24 image as base
FROM node:24-slim AS builder

# Set working directory inside the container
WORKDIR /app

# Set DATABASE_URL for Prisma (temporary for build, will be overridden at runtime)
ENV DATABASE_URL="file:/app/data/sqlite.db"

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src ./src/

# Build the TypeScript application
RUN npm run build

# Compile seed file
RUN npx tsc prisma/seed.ts --outDir dist/prisma --target ES2020 --moduleResolution node --module esnext --esModuleInterop

# Production stage
FROM node:24-slim

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set DATABASE_URL for Prisma (will be overridden by .env file at runtime)
ENV DATABASE_URL="file:/app/data/sqlite.db"

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma files
COPY prisma ./prisma/

# Generate Prisma client in production
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create directory for SQLite database
RUN mkdir -p /app/data

# Create SQLite database file
RUN touch /app/data/sqlite.db

# Start the application with migrations and seeding
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && npm start"]
