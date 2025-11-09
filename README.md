# project-showcase-backend

## Environment Configuration

This application uses environment variables for configuration. Follow these steps to set up your environment:

### 1. Create Environment File

Copy the example environment file and customize it for your setup:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit your `.env` file with the following variables:

| Variable                        | Description                           | Default                           | Example                                    |
| ------------------------------- | ------------------------------------- | --------------------------------- | ------------------------------------------ |
| `ADMIN_EMAILS`                  | Comma-separated admin emails          | (empty)                           | `admin1@example.com,admin2@example.com`    |
| `PORT`                          | Server port                           | `3000`                            | `3000`                                     |
| `NODE_ENV`                      | Environment mode                      | `development`                     | `development`, `production`, `test`        |
| `DATABASE_URL`                  | Database connection string            | `file:./dev.db`                   | `postgresql://user:pass@localhost:5432/db` |
| `RATE_LIMIT_WINDOW_MS`          | Rate limit window in milliseconds     | `900000` (15 min)                 | `900000`                                   |
| `RATE_LIMIT_MAX_REQUESTS`       | Max requests per window               | `100`                             | `100`                                      |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account JSON | `./firebase-service-account.json` | `./config/firebase.json`                   |
| `PRISMA_LOG_QUERIES`            | Enable query logging                  | `true`                            | `true`, `false`                            |
| `PRISMA_LOG_ERRORS`             | Enable error logging                  | `true`                            | `true`, `false`                            |
| `PRISMA_LOG_WARNINGS`           | Enable warning logging                | `true`                            | `true`, `false`                            |

### 3. Seed Admin Users

Add admin emails to your `.env` file and run the seed script:

```bash
# Add to .env:
# ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Run seed script
npm run seed
```

### 4. Running in Different Environments

```bash
# Development
npm run dev

# Production (after building)
npm run build
npm start

# Test environment
npm run test
```

## Docker Deployment

This application includes Docker support with automatic database migrations and admin user seeding on startup.

### Quick Start with Docker

```bash
# Build the image
docker build -t project-showcase-backend .

# Run the container
docker run -d \
  --name showcase-backend \
  -p 8000:8000 \
  -e ADMIN_EMAILS="admin1@example.com,admin2@example.com" \
  -e DATABASE_URL="file:/app/data/dev.db" \
  -e NODE_ENV="production" \
  -v $(pwd)/data:/app/data \
  project-showcase-backend

# View logs
docker logs -f showcase-backend
```

### What Happens on Container Startup

The Dockerfile CMD runs three commands sequentially:

1. **`npx prisma migrate deploy`** - Database migrations run automatically
2. **`npm run seed`** - Admin users are seeded from `ADMIN_EMAILS`
3. **`npm start`** - Server starts and accepts connections
