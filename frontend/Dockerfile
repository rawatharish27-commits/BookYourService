# ---------- BUILD STAGE ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build frontend (Vite)
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run listens on 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
