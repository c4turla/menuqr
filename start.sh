#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx drizzle-kit migrate

echo "✅ Migrations done. Starting app..."
# Patch server.js to bind to 0.0.0.0 explicitly without breaking internal fetch
sed -i "s/process.env.HOSTNAME || 'localhost'/\"0.0.0.0\"/g" server.js || true
sed -i 's/process.env.HOSTNAME || "localhost"/"0.0.0.0"/g' server.js || true

exec node server.js
