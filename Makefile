.DEFAULT_GOAL := help
SERVER_DIR := cd server/

#? build: Build server.
build:
	@$(SERVER_DIR) && cargo build

#? run: Run server.
run: build
	@$(SERVER_DIR) && RUST_LOG=debug cargo run

#? fmt: Format Rust files.
fmt:
	@$(SERVER_DIR) && cargo fmt

#? help: Get more info on make commands.
help: Makefile
	@echo ''
	@echo 'Usage:'
	@echo '  make [target]'
	@echo ''
	@echo 'Targets:'
	@sed -n 's/^#?//p' $< | column -t -s ':' |  sort | sed -e 's/^/ /'
