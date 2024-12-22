# Stage 1: Build the Vite App
FROM node:latest AS builder
WORKDIR /app
ARG VITE_API_BASE_URL="/api"
COPY . .
RUN npm ci
RUN npm run build

# Stage 2: Serve the Built App with Nginx
FROM nginx:alpine
RUN apk add --no-cache openssl
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/cert.key -out /etc/nginx/cert.crt \
    -subj "/C=US/ST=YourState/L=YourCity/O=YourOrg/CN=localhost"
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
