![Screenshot from 2022-05-21 22-33-51](https://user-images.githubusercontent.com/36077702/169668162-6e1f48b7-86bd-42b1-9c1a-1222e7d524b9.png)

## Features
* The owner can start a lottery.
* Users can join the lottery up until the maximum number is reached.
* Data is stored on The Graph subgraph of the application.
* Winner is randomly chosen using Chainlink VRF.

![Screenshot from 2022-05-21 22-02-29](https://user-images.githubusercontent.com/36077702/169667283-ee3c02c2-8432-48df-85f4-bfdd40622774.png)



# Steps to set up the project on your local machine
**We are going to work with _mumbai_ testnet network while connecting to _Alchemy_.**

Mumbai is an Ethereum test network that allows for blockchain development testing without paying gas fees with real money like on the mainnet.

Alchemy is a node provider. It helps your app communicate with contracts on the blockchain like a bridge.
### Setup
- install `npm` and `npx` on your machine
- run `npm install` to set up all the dependencies (hardhat, ethers, etc.)
- set up a [Metamask](https://metamask.io/download.html) wallet
- get free matic on mumbai testnet [here](https://mumbaifaucet.com/)
- set up an Alchemy account [here](https://alchemy.com/?a=641a319005)
- create`.env` file and then fill in the following environment variables with your own info
```shell
  ETHERSCAN_API_KEY=
  MUMBAI_URL=
  PRIVATE_KEY=
```


### Commands:
- run `npx hardhat compile` if you want to compile your smart contracts
- run `npx hardhat run scripts/deploy.js --network mumbai` to deploy the contract to the Mumbai testnet
- modify `.config.ts` file with addresses from the previous command
- run `npm run dev` to start the local server; you should be able to access the app on `localhost:3000`
- run `npx hardhat test` to run unit tests
- run `npx hardhat verify --network mumbai <DEPLOYED_CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMS> ` to verify your contract