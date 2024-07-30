.DEFAULT_GOAL := help
CONTRACT_DIR = cd contract/
SERVER_DIR = cd server/
APP_DIR = cd app/

.PHONY: concordium contract test app build run fmt help

#? concordium: Install Concordium SDK.
concordium:
	@rustup target add wasm32-unknown-unknown
	@cargo install --locked cargo-concordium

#? contract: Build contract.
contract:
	@$(CONTRACT_DIR) && cargo concordium build --out dist/module.wasm.v1 --schema-out dist/schema.bin

#? test: Test contract.
test:
	@$(CONTRACT_DIR) && cargo concordium test

#? app: Build client application.
app:
	@$(APP_DIR) && npm run build

#? build: Build server.
build:
	@$(SERVER_DIR) && cargo build

#? run: Run server.
run: build
	@$(SERVER_DIR) && RUST_LOG=debug cargo run

fmt-a:
	@$(APP_DIR) && npm run fmt

fmt-c:
	@$(CONTRACT_DIR) && cargo fmt

fmt-s:
	@$(SERVER_DIR) && cargo fmt

#? fmt: Format all files.
fmt: fmt-a fmt-c fmt-s

#? help: Get more info on make commands.
help: Makefile
	@echo ''
	@echo 'Usage:'
	@echo '  make [target]'
	@echo ''
	@echo 'Targets:'
	@sed -n 's/^#?//p' $< | column -t -s ':' |  sort | sed -e 's/^/ /'
