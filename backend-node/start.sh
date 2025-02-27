#!/bin/sh

# Install Java & Maven
apt update && apt install -y openjdk-17-jdk maven

# Build TypeScript Code (Ensures dist/server.js is created)
npm install
npm run build

# Start the Node.js Backend from dist/
node dist/server.js
