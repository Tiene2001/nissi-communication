#!/bin/sh
set -e
echo "[NISSI] Running Prisma migrations..."
npx prisma migrate deploy
echo "[NISSI] Starting NestJS server..."
exec node dist/src/main
