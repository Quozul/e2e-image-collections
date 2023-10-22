FROM rust:slim-buster as build

# create a new empty shell project
RUN USER=root cargo new --bin rustful-webftp
WORKDIR /rustful-webftp

# copy over your manifests
COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml

# this build step will cache your dependencies
RUN cargo build --release
RUN rm src/*.rs

# copy your source tree
COPY ./src ./src

# build for release
RUN rm ./target/release/deps/rustful_webftp*
RUN cargo build --release

# our final base
FROM rust:1.64-slim-buster

# copy the build artifact from the build stage
COPY --from=build /rustful-webftp/target/release/rustful-webftp .

EXPOSE 8000

# set the startup command to run your binary
CMD ["./rustful-webftp"]
