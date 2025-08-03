# Use Node.js 20 Alpine as base image for smaller size
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Development stage
FROM base AS development
# Install all dependencies including dev dependencies
RUN npm ci
# Copy source code
COPY . .
# Expose port 5173 (Vite default)
EXPOSE 5173
# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
# Install all dependencies including dev dependencies
RUN npm ci
# Copy source code
COPY . .
# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production
# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
# Expose port 80
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"] 