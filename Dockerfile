# ================================
# BUILD STAGE (Frontend)
# ================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy frontend source
COPY frontend/ .

# Build frontend
RUN npm run build


# ================================
# PRODUCTION STAGE (Nginx)
# ================================
FROM nginx:stable-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy root nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend files
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Cloud Run required port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
