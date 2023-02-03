# plvGLP Oracle

This repository contains the contracts and associated tooling to test and deploy oracle contracts to report the price of plvGLP. This repository relies heavily on hardhat and hardhat-deploy. If you are unfamiliar with the usage of these packages, please refer to the following:

Hardhat: https://hardhat.org/docs

Hardhat-Deploy: https://github.com/wighawag/hardhat-deploy

# Installation

In order to make use of the files in this repository, first install all required packages via npm (do not use yarn)

```shell
npm install
```

You will need to create a .env file and populate it with required environment variables, namely deployment wallet private key, provider API keys, and etherscan API keys.

# Contracts

## Core Contracts

***NOTE:  THE RETURNED PRICES FROM ALL ORACLE CONTRACTS ARE DENOMINATED IN USD WEI.***

-plvGLPOracle: an oracle contract that utilizes a moving average calculation of the plvGLP/GLP exchange rate in price calculations over a user-defined window.

-plvGLPOracleSimple: an oracle contract which reports the true price of plvGLP.

-plvGLPOracleFixed: the first iteration of the upgraded plvGLP oracle contract. This contract uses a fixed average calculation of the plvGLP/GLP exchange rate. Note that this contract is deprecated and is to be used for reference purposes only.

## Supporting Contracts

-Whitelist for specifying addresses that are able to add moving average data points

-Various interfaces for interacting with GLP/plvGLP contracts and ERC20 tokens

-Mock contracts for GLP and plvGLP for use on testnet

***NOTE: THE CONTRACTS LOCATED IN THE TESTING FOLDER ARE FOR TESTNET PURPOSES ONLY.***

# Compiling Contracts

First ensure the selected solidity compiler in the hardhat config file agrees with the pragma statements in the contracts. To compile the contracts, run the following command:

```shell
npx hardhat compile
```

# Testing

To run the testing suites on the contracts, run the following command:

```shell
npx hardhat test
```

# Deployment

This repository leverages the hardhat-deploy package to facilitate contract deployments and storage of contract artifacts/ABI's. The scripts to deploy contracts are in the deploy directory. To deploy all contracts at once, run the following command:

```shell
npx hardhat deploy --network <network name>
```

Contracts can be deployed individually as well if they are labelled with a tag in their deployment script. To deploy an individual contract, run the following command (note that contract tags are case sensitive):

```shell
npx hardhat deploy --network <network name> --tags <contract tag>
```

# Contract verification

Deployed contracts can be verified on arbiscan by running the following command:

```shell
npx hardhat verify --network <network name> <contract address> <constructor arguments>
```

Note that the syntax of the constructor arguments needs to match the constructor function of the contract being verified. The arguments passed to the verify function are NOT separated by commas and are NOT strings.
