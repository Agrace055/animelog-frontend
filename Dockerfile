# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Inject build-time env vars so Vite's loadEnv can pick them up
ARG GEMINI_API_KEY=""
RUN echo "GEMINI_API_KEY=${GEMINI_API_KEY}" > .env

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:1.27-alpine

COPY nginx/http.conf /etc/nginx/config-templates/http.conf
COPY nginx/https.conf /etc/nginx/config-templates/https.conf
COPY nginx/40-configure-nginx.sh /docker-entrypoint.d/40-configure-nginx.sh
RUN chmod +x /docker-entrypoint.d/40-configure-nginx.sh
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443
