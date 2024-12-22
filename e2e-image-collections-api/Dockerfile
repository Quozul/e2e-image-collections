FROM rust:alpine AS builder
WORKDIR /usr/src/api
COPY . .
RUN apk add --no-cache musl-dev
RUN cargo install --path .

FROM alpine
COPY --from=builder /usr/local/cargo/bin/api /usr/local/bin/api
WORKDIR /app
CMD ["api"]
