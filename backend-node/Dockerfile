# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# Set environment variables for build-time
ENV NODE_ENV=production
ENV JAVA_PROJECT_PATH="/app/demo-java-app"

# Install required dependencies (Java & Maven)
RUN apk add --no-cache openjdk17 maven git

# Set working directory
WORKDIR /app

# Copy backend package files and install all dependencies (including devDependencies)
COPY backend-node/package.json backend-node/package-lock.json ./
RUN npm install

# Ensure TypeScript is installed globally for the build step
RUN npm install -g typescript

# Copy backend source code & build
COPY backend-node/. .
RUN npm run build

# Copy Java project from root
COPY demo-java-app /app/demo-java-app

# --- Stage 2: Production Stage ---
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Install Java, Maven, and Git for runtime execution
RUN apk add --no-cache openjdk17 maven git

# Copy only built backend files from builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/demo-java-app /app/demo-java-app

# Install only production dependencies (ensures minimal size)
RUN npm ci --omit=dev

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV MAVEN_PATH="/usr/bin/mvn"
ENV JAVA_PROJECT_PATH="/app/demo-java-app"

# Ensure Maven is accessible
RUN ln -s /usr/bin/mvn /usr/local/bin/mvn

# Expose the necessary port
EXPOSE 8080

# Start the application
CMD ["node", "dist/server.js"]
