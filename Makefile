.DEFAULT_GOAL := help
CONTRACT_DIR = cd contract/
SERVER_DIR = cd server/

#? concordium: Install Concordium SDK.
concordium:
	rustup target add wasm32-unknown-unknown
	cargo install --locked cargo-concordium

#? contract: Build contract.
contract:
	@$(CONTRACT_DIR) && cargo concordium build --out dist/module.wasm.v1 --schema-out dist/schema.bin

#? test: Test contract.
test:
	@$(CONTRACT_DIR) && cargo concordium test

#? build: Build server.
build:
	@$(SERVER_DIR) && cargo build

#? run: Run server.
run: build
	@$(SERVER_DIR) && RUST_LOG=debug cargo run

fmt-c:
	@$(CONTRACT_DIR) && cargo fmt

fmt-s:
	@$(SERVER_DIR) && cargo fmt

#? fmt: Format Rust files.
fmt: fmt-c fmt-s

#? help: Get more info on make commands.
help: Makefile
	@echo ''
	@echo 'Usage:'
	@echo '  make [target]'
	@echo ''
	@echo 'Targets:'
	@sed -n 's/^#?//p' $< | column -t -s ':' |  sort | sed -e 's/^/ /'
