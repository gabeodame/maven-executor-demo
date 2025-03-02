# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# Set environment variables for build-time
ENV NODE_ENV=production
ENV JAVA_PROJECT_PATH="/app/demo-java-app"
ENV MAVEN_PATH="/usr/local/bin/mvn"

# Install required dependencies (Java, Maven, Git)
RUN apk add --no-cache openjdk17 maven git

# ✅ Ensure Maven is accessible
RUN ln -s /usr/bin/mvn /usr/local/bin/mvn

# ✅ Verify Maven installation
RUN mvn --version

# Set working directory
WORKDIR /app

# ✅ Copy backend package files first
COPY ../../backend-node/package.json ../../backend-node/package-lock.json ./
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# ✅ Copy backend source code & build
COPY ../../backend-node/. .
RUN npm run build

# ✅ Copy Java project
COPY ../../demo-java-app /app/demo-java-app

# --- Stage 2: Production Stage ---
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Install Java, Maven, and Git for runtime execution
RUN apk add --no-cache openjdk17 maven git

# ✅ Ensure Maven is accessible
RUN ln -s /usr/bin/mvn /usr/local/bin/mvn

# ✅ Copy only built backend files from builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/demo-java-app /app/demo-java-app

# ✅ Install only production dependencies
RUN npm ci --omit=dev

# Set runtime environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV MAVEN_PATH="/usr/local/bin/mvn"
ENV JAVA_PROJECT_PATH="/app/demo-java-app"

# Expose the necessary port
EXPOSE 8080

# Start the application
CMD ["node", "dist/server.js"]
