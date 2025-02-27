# Use lightweight Node.js image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json & install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy backend source code
COPY . .

# Expose the port Fly.io will use
ENV PORT=8080
EXPOSE 8080

# Start the backend server
CMD ["node", "dist/server.js"]
