#!/bin/bash
set -e

PKG_NAME=$(node -p "require('./package.json').name")
CONTAINER_NAME="${PKG_NAME}-test-db"
DATABASE_URL="postgresql://testuser:testpass@localhost:5555/testdb"

cleanup() {
  echo "Cleaning up test database container..."
  docker stop "$CONTAINER_NAME" 2>/dev/null
  docker rm "$CONTAINER_NAME" 2>/dev/null
  echo "Done."
}

# Always clean up on exit, whether tests pass or fail
trap cleanup EXIT

# Remove any leftover container from a previous run
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Start PostgreSQL container
docker run --name "$CONTAINER_NAME" \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=testdb \
  -p 5555:5432 \
  -d postgres:17

# Wait for PostgreSQL to be ready
bash scripts/test-db-wait.sh

# Push schema to test database
DATABASE_URL="$DATABASE_URL" bun db:push

# Run integration tests
DATABASE_URL="$DATABASE_URL" \
  vitest run --config vitest.integration.config.ts
