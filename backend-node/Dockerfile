# Stage 1: Build TypeScript
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install # Installs devDependencies including TypeScript
COPY . . 

# Set NODE_ENV explicitly
ENV NODE_ENV=production

# Compile TypeScript
RUN npm run build 

# Stage 2: Run production code
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only built output and necessary files (NO devDependencies)
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist /app/dist

# Install only production dependencies
RUN npm install --production

# Expose the port
EXPOSE 8080

# Start the backend
CMD ["node", "dist/server.js"]
