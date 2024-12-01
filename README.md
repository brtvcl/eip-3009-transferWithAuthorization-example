# Ethereum EIP-3009 transferWithAuthorization Example with USDC

This repository contains an example of how to use Ethers.js to interact with an Ethereum blockchain, demonstrating the use of EIP-712 signatures for an off-chain approved EIP-3009 transfer of USDC tokens.

transferWithAuthorization allows gasless transfer transaction by signing a structured data object off-chain and sending it to the gas sponsor to execute the transfer. In the example we have 3 actors: sender, recipient and sponsor. The sender signs the structured data object, the recipient receives the tokens and the sponsor pays for the gas.

## Features

- Interacts with Ethereum-based smart contracts using Ethers.js.
- Demonstrates the use of EIP-712 structured data signing for secure and gas-efficient token transfers.
- Provides an example of the EIP-3009 transferWithAuthorization function available in USDC smart contracts.
- Includes validation for signed transactions to ensure correctness before sending to the blockchain.

## Requirements

Before running the script, ensure you have the following set up:

1. Node.js installed on your system.
2. An Ethereum node endpoint or service like Infura or Alchemy.
3. An .env file configured with the necessary details in the root directory of the project. Look at the .env.example file to see the required variables.
