# Stage 1: Build Vue 3 / Vite static assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and run build
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm run build

# Stage 2: Nginx lightweight Web Server
FROM nginx:stable-alpine

# Copy dist bundle to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
