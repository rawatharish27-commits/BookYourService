FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Cloud Run required port
EXPOSE 8080

# Start backend
CMD ["npm", "start"]
