.DEFAULT_GOAL := help
CONTRACT_DIR = cd contract/
SERVER_DIR = cd server/
CLIENT_DIR = cd client/

.PHONY: install concordium contract test client build run fmt help

###################
## INITIAL SETUP ##
###################

#? install: Install the necessary dependencies.
install: concordium
	@$(CLIENT_DIR) && npm install

#? concordium: Install Concordium SDK.
concordium:
	@rustup target add wasm32-unknown-unknown
	@cargo install --locked cargo-concordium

##############################
## CONCORDIUM: BUILD & TEST ##
##############################

#? contract: Build contract.
contract:
	@$(CONTRACT_DIR) && cargo concordium build --out dist/module.wasm.v1 --schema-out dist/schema.bin

#? test: Test contract.
test: contract
	@$(CONTRACT_DIR) && cargo concordium test

######################################
## APPLICATION: BUILD & RUN LOCALLY ##
######################################

#? client: Build client application.
client:
	@$(CLIENT_DIR) && npm run build

#? build: Build server.
build:
	@$(SERVER_DIR) && cargo build

#? run: Run server.
run: build
	@$(SERVER_DIR) && RUST_LOG=debug cargo run

##############################
## APPLICATION: WITH DOCKER ##
##############################

#? up: Start Docker container.
up:
	@docker compose up --build

#? down: Stop Docker container.
down: build
	@docker compose down

############
## FORMAT ##
############

fmt-a:
	@$(CLIENT_DIR) && npm run fmt

fmt-c:
	@$(CONTRACT_DIR) && cargo fmt

fmt-s:
	@$(SERVER_DIR) && cargo fmt

#? fmt: Format all files.
fmt: fmt-a fmt-c fmt-s

##########
## HELP ##
##########

#? help: Get more info on make commands.
help: Makefile
	@echo ''
	@echo 'Usage:'
	@echo '  make [target]'
	@echo ''
	@echo 'Targets:'
	@sed -n 's/^#?//p' $< | column -t -s ':' | sed -e 's/^/ /'
