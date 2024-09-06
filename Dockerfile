ARG node_base_image=node:20.16.0-alpine
ARG rust_base_image=rust:1.80.0-slim

# Build client
FROM ${node_base_image} AS node_build
WORKDIR /client

RUN npm i -g pnpm
COPY ./client/package.json .
RUN pnpm i
COPY ./client/ .

RUN pnpm run build

# Build server
FROM ${rust_base_image} AS rust_build
WORKDIR /server

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates
COPY ./server/src ./src
COPY ./server/Cargo.lock .
COPY ./server/Cargo.toml .

RUN cargo build --release

# Build aureum
FROM ubuntu:24.04
WORKDIR /aureum
ENV RUST_LOG=debug

COPY --from=rust_build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=rust_build ./server/target/release/server .
COPY --from=node_build ./dist ../dist
COPY ./server/config ./config

CMD ["./server"]
# CMD ["./server", "||", "tail", "-f", "/dev/null"]
