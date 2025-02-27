#!/bin/sh

# Install Java & Maven
apk add --no-cache openjdk17 maven

# Verify installation
mvn -version || { echo "❌ ERROR: Maven is not installed properly"; exit 1; }

# Install Node.js dependencies
npm install --production

# Compile TypeScript (Ensures dist/server.js exists)
npm run build

# Start the Node.js Backend
exec node dist/server.js
