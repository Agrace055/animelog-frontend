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

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
