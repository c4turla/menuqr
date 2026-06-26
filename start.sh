#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx drizzle-kit migrate

echo "✅ Migrations done. Starting app..."
exec node server.js
