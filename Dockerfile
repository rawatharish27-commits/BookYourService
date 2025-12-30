# =========================
# BUILD STAGE
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments (for Vite / frontend)
ARG API_KEY
ENV VITE_GEMINI_API_KEY=$API_KEY

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build the frontend (Vite)
RUN npm run build


# =========================
# PRODUCTION STAGE
# =========================
FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run uses 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
