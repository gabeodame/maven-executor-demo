#!/bin/sh

# Install Java & Maven (for executing Maven commands)
apt update && apt install -y openjdk-17-jdk maven

# Install Node.js dependencies
npm install

# Compile TypeScript (Ensures dist/server.js exists)
npm run build

# Start the Node.js Backend from dist/
exec node dist/server.js
