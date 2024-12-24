# syntax=docker/dockerfile:1.7-labs
FROM node:latest AS front-builder
WORKDIR /usr/src/front
ARG VITE_API_BASE_URL="/api"
COPY package.json package-lock.json ./
RUN npm ci
# --exclude requires Dockerfile version 1.7-labs
COPY --exclude=e2e-image-collections-api . .
RUN npm run build

FROM rust:alpine AS api-builder
WORKDIR /usr/src/back
COPY e2e-image-collections-api .
RUN apk add --no-cache musl-dev
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/src/back/target \
    cargo install --path .

FROM alpine
WORKDIR /app
COPY --from=api-builder /usr/local/cargo/bin/api /usr/local/bin/api
COPY --from=front-builder /usr/src/front/dist /app/static

RUN apk add --no-cache openssl
RUN mkdir -p /app/self_signed_certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /app/self_signed_certs/key.pem -out /app/self_signed_certs/cert.pem \
    -subj "/C=US/ST=YourState/L=YourCity/O=YourOrg/CN=localhost"

ENV CARGO_MANIFEST_DIR /app
ENV TLS TRUE
EXPOSE 443
CMD ["api"]
