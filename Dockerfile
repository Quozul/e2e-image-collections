FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.23-alpine
WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx /etc/nginx/

EXPOSE 80
ENV PORT 80
