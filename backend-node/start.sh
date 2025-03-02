#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure NODE_ENV is set properly
export NODE_ENV=production

# Install Java & Maven
apk add --no-cache openjdk17 maven

# Verify installation
mvn -version || { echo "❌ ERROR: Maven is not installed properly"; exit 1; }

# Install Node.js dependencies
npm ci --only=production

# Compile TypeScript (Ensures dist/server.js exists)
npm run build

# Start the Node.js Backend
exec node dist/server.js
