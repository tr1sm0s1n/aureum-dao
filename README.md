# AUREUM - Concordium Charity DAO

Welcome to the **AUREUM**, a Charity DAO DApp, built on the **Concordium** blockchain (currently exclusive to residents of India). This project aims to create a decentralized autonomous organization (DAO) to manage and distribute charitable donations transparently and efficiently.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Docker Setup (Recommended)](#docker-setup)
  - [Manual Setup](#manual-setup)
- [Usage](#usage)
  - [Testing the Smart Contract](#testing-the-smart-contract)
  - [Deploying the Smart Contract](#deploying-the-smart-contract)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Introduction

AUREUM leverages the power of blockchain technology to ensure that charitable funds are collected, managed, and distributed in a transparent and trustless manner. By using a DAO, we eliminate the need for intermediaries, reduce overhead costs, and ensure that donations reach those in need more efficiently.

## Features

- **Zero-Knowledge-Based ID System**: Ensures user privacy while maintaining regulatory compliance, allowing users to prove their identity without revealing personal information.
- **Transparent Donations**: All transactions are recorded on the blockchain, ensuring transparency.
- **Decentralized Governance**: Donors can vote on proposals for fund distribution. Renounce votes if deemed necessary.
- **Secure**: Built on the Concordium blockchain, which provides strong privacy features and regulatory compliance.
- **Automated Processes**: Smart contract automate the collection and distribution of funds.

> **Note:** Anyone can propose a charity in the application, but voting power is granted to those who deposit amount into the smart contract.

## Getting Started

### Docker Setup

The easiest way to run the AUREUM application is by using **Docker**.

1. Clone the repository:

```bash
git clone https://github.com/tr1sm0s1n/aureum-dao.git
cd aureum-dao
```

2. Build and run the Docker container:

```bash
make up
```

This will build the client and server in a Docker container and start the application.

3. Access the application:

Once the container is running, you can access the AUREUM DAO app by navigating to http://localhost:4800 in your browser.

### Manual Setup

If you prefer to run the application without Docker, you'll need to install the prerequisites.

#### Prerequisites

- **Rust** for compiling and running the backend.
- **Node.js** for building the frontend.

#### Installation

1. Clone the repository:

```bash
git clone https://github.com/tr1sm0s1n/aureum-dao.git
cd aureum-dao
```

2. Install dependencies:

```bash
make install
```

4. Build the frontend:

```bash
make client
```

5. Build and start the backend:

```bash
make run
```

This will launch the application on http://localhost:4800.

> **Note:** Country of residence can be updated based on the need. Simply edit [`statement.json`](./server/config/statement.json).

## Usage

### Testing the Smart Contract

**Rust** is required for the following steps.

1. Install `cargo-concordium`:

```bash
make concordium
```

2. Build the smart contract:

```bash
make contract
```

3. Test the smart contract:

```bash
make test
```

### Deploying the Smart Contract

Check out the [Developer Docs](https://developer.concordium.software/en/mainnet/smart-contracts/guides/quick-start.html) for instructions.

Update the [`config.ts`](./client/src/config/config.ts) file with the latest `CONTRACT_INDEX`, `MODULE_REF` and `RAW_SCHEMA_BASE64` if necessary.

## Contributing

Contributions are what makes the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/<feature_name>`)
3. Commit your Changes (`git commit -m '✨ | add <feature_name>'`)
4. Push to the Branch (`git push origin feature/<feature_name>`)
5. Open a Pull Request

Feel free to open issues or discussions for further conversation. 😊

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.

## Acknowledgements

- [Concordium](https://www.concordium.com/) for their blockchain platform and development tools.
- Open-source community for various libraries and tools used in this project.
