# Use lightweight Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies separately (better caching)
COPY package.json package-lock.json ./
RUN npm install --production

# Now copy the rest of the application (excluding node_modules)
COPY . .

# Ensure node_modules exists and is not overwritten
RUN ls -la node_modules || echo "node_modules missing"

# Expose the Fly.io port
ENV PORT=8080
EXPOSE 8080

# Start the backend server
CMD ["node", "dist/server.js"]
