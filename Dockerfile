ARG node_base_image=node:20.16.0-alpine
ARG rust_base_image=rust:1.80.0-slim

# Build client
FROM ${node_base_image} AS node_build
WORKDIR /app

RUN npm i -g pnpm
COPY ./app/package.json .
RUN pnpm i
COPY ./app/ .

RUN pnpm run build

# Build server
FROM ${rust_base_image} AS rust_build
WORKDIR /server

COPY ./server/src ./src
COPY ./server/Cargo.lock .
COPY ./server/Cargo.toml .

RUN cargo build --release


FROM ubuntu:22.04
WORKDIR /aureum
ENV RUST_LOG=debug

COPY ./server/config ./config
COPY --from=rust_build ./server/target/release/server .
COPY --from=node_build ./dist ./dist

RUN chmod +x ./server

CMD ["./server"]
