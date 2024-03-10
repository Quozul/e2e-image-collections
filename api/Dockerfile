FROM rust:slim-buster as build

# create a new empty shell project
RUN USER=root cargo new --bin api
WORKDIR /api

# copy over your manifests
COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml

# this build step will cache your dependencies
RUN cargo build --release
RUN rm src/*.rs

# copy your source tree
COPY ./src ./src

# build for release
RUN rm ./target/release/deps/api*
RUN cargo build --release

# our final base
FROM rust:1.64-slim-buster

WORKDIR /app
COPY --from=build /api/target/release/api .

EXPOSE 8000

# set the startup command to run your binary
CMD ["./api"]
