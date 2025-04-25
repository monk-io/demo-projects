# Use official Node.js LTS image
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source
COPY app.js ./

# Expose the port (default 3000, can be overridden by PORT env)
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production

# Start the app
CMD ["npm", "start"]
