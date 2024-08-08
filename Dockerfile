ARG node_base_image=node:20.16.0-alpine
ARG rust_base_image=rust:1.80.0-alpine

FROM ${node_base_image} AS node_build
WORKDIR /app
RUN npm i -g pnpm
COPY ./app/package.json ./package.json
RUN pnpm i
COPY ./app/ .
RUN pnpm run build

FROM ${rust_base_image} AS rust_build
WORKDIR /server
COPY ./server/src ./src
COPY ./server/Cargo.lock ./Cargo.lock
COPY ./server/Cargo.toml ./Cargo.toml
RUN cargo build --release