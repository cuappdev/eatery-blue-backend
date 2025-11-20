# Use Node.js 24 image as base
FROM node:24-slim AS builder

# Set working directory inside the container
WORKDIR /app

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

# Production stage
FROM node:24-slim

# Install openssl for Prisma (required for PostgreSQL)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

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

# Start the application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
