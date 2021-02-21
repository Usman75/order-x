# Orderx.Exchange-Beta (onchain - orderbook) on Binance Smart cahin (Testnet)Dapp
## Binance Hackathon: The Future Is Now

## 🔥 [Live Demo](https://orderx-exchange.herokuapp.com/) 🔥

### Demo
[![OrderX Demo](http://img.youtube.com/vi/l8P_Wmxoobo/default.jpg)](https://youtu.be/l8P_Wmxoobo)

## About this project

A decentralized exchange allow trading with BEP20 tokens using orderbook. The quote currency is BUSD. There are 2 trading options : limited order and market order. Users can create buy/sell limit/market orders. They can deposit/ withdraw tokens between their Metamask wallets and their Orderx.Exchange account.

#### Orderx Contract on BSC Testnet
- Orderx Exchange Contract: [0xFb2659C50778Ce810124B2b322dED92a7233C3eC](https://testnet.bscscan.com/address/0xFb2659C50778Ce810124B2b322dED92a7233C3eC)
#### Mock Token on BSC Testnet
- BUSD Mock Token: [0xe97b2d94F82Eca0dE1c9D552aD4ABC1C8C3dD4ec](https://testnet.bscscan.com/address/0xe97b2d94F82Eca0dE1c9D552aD4ABC1C8C3dD4ec)
- WBNB Mock Token: [0x4F0c19f92eCEFcECC231F12818FE8D5f14608f5A](https://testnet.bscscan.com/address/0x4F0c19f92eCEFcECC231F12818FE8D5f14608f5A)
- CAKE Mock Token: [0xfBaAC96Fa9cf01bc5f851E978605827Ec4f357A0](https://testnet.bscscan.com/address/0xfBaAC96Fa9cf01bc5f851E978605827Ec4f357A0)
- DOT Mock Token: [0xcDd3D1Df4c16c3d8eDbC930F08A0Ed8Ca689B375](https://testnet.bscscan.com/address/0xcDd3D1Df4c16c3d8eDbC930F08A0Ed8Ca689B375)

## Archiect of Orderx.Exchange

User wallet (default to be Metamask)
Frontend (Web app)
Smart contract (Blockchain)

A frontend which is the Web app is connected to both user wallet and the smart contract. User uses the web app to interact with the Orderx smart contract. When sending any transaction, user wallet will prompt the user for confirmation.

## Preset data for interaction 

# Mock tokens

Mock 4 BEP20 tokens (BUSD, WBNB, CAKE, DOT) for this project instead of interact with live tokens

# Preset order and trade data

Preset trade data and order data when deploy the contract in "2_deploy_contracts.js"


## Pre-requisites and programs used versions:

- Truffle v5.1.7 (core: 5.1.7)
- Solidity v0.6.3 (solc-js)
- Node v10.17.0
- Web3.js v1.2.1
- npm 6.11.3
- Ganache CLI v6.7.0 (ganache-core: 2.8.0)
- MetaMask V7.7.3
- Openzeppelin

## Setting up the development environment

1. Install Truffle: 
    >npm install -g truffle

2. Install ganache-cli:
    >npm install -g ganache-cli

3. Install MetaMask in your browser (https://metamask.io/)

4. Install Openzepplin testing package*
    >npm install @openzeppelin/text-helpers

## Installation/Running

**Launching local blockchain with Ganache**

First launch the local testing blockchain with 10 default testing accounts which contains ETH.
Open up a new seperate terminal, and run the following command:

    >truffle develop

New blockchain listens on **127.0.0.1:9545** by default
Copy the MNEMONIC seed to Metamask and connect Metamask as "LocalHost 9545" on the port listed above.

**In order to keep development environment running, do not close this terminal**

**Clone the project**

Open up another new terminal, make sure the ganache-cli terminal is running at the same time.

1. git clone <url of this project>

2. Move to the directory
    >npm install

3. Compile the contracts
    >truffle compile

4.  Migrate to ganache-cli
    >truffle migrate --reset

5. Run tests. (All tests should pass)
    >truffle test

6. Run Dapp, move to frontend folder
    > cd frontend
7. Install the dependencies
    > yarn install
8. Run the App
    > yarn start
9. Or follow these [Instructions](https://github.com/Usman75/order-x/blob/main/frontend/README.md)
   

## Visiting an URL and interact with the application

- http://localhost:3000/
- This Dapp requires to interact with MetaMask. When the dapp loaded, MetaMask pop-up will appear if installed properly, requesting your approveal to allow DEX Dapp connect to MetaMask wallet. Please choose **Connect**.

## Project developed by : Solidity, Smart contract, Web3, React, bootstrap
