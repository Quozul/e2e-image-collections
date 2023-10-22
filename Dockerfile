FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=/api

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.25-alpine-slim
WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx /etc/nginx/

EXPOSE 443 80
ENV PORT 443
