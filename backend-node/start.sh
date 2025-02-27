#!/bin/sh

# Install Java & Maven
apt update && apt install -y openjdk-17-jdk maven

# Start the Node.js Backend
node dist/server.js

