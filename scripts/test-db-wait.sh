#!/bin/bash
# Wait for PostgreSQL to be ready
set -e

MAX_RETRIES=30
RETRY_INTERVAL=1

for i in $(seq 1 $MAX_RETRIES); do
  if pg_isready -h localhost -p 5555 -U testuser > /dev/null 2>&1; then
    echo "PostgreSQL is ready"
    exit 0
  fi
  echo "Waiting for PostgreSQL... ($i/$MAX_RETRIES)"
  sleep $RETRY_INTERVAL
done

echo "PostgreSQL did not become ready in time"
exit 1
