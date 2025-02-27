# Stage 1: Build Stage
FROM node:20-alpine AS builder

# Install required dependencies (Java & Maven)
RUN apk add --no-cache openjdk17 maven

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend-node/package.json backend-node/package-lock.json ./
RUN npm install

# Copy backend source code & build
COPY backend-node/. .
RUN npm run build

# Copy Java project from root
COPY demo-java-app /app/demo-java-app  

# Stage 2: Production Stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Install Java & Maven for executing Maven commands
RUN apk add --no-cache openjdk17 maven

# Copy only required files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/demo-java-app /app/demo-java-app 

# Install only production dependencies
RUN npm install --production

# Set Environment Variables
ENV NODE_ENV=production
ENV PORT=8080
ENV MAVEN_PATH="/usr/bin/mvn"
ENV JAVA_PROJECT_PATH="/app/demo-java-app"

# Ensure Maven is accessible
RUN ln -s /usr/bin/mvn /usr/local/bin/mvn

# Expose Port
EXPOSE 8080

# Start Server
CMD ["node", "dist/server.js"]
