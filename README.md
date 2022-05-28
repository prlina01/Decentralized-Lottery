![Screenshot from 2022-05-28 13-00-35](https://user-images.githubusercontent.com/36077702/170822615-02131690-e2ce-471b-9559-4e0b20b481f8.png)

## Features
* The owner can start a lottery.
* Users can join the lottery up until the maximum number is reached.
* Data is stored on The Graph subgraph of the application.
* Winner is randomly chosen using Chainlink VRF.

![Screenshot from 2022-05-28 12-57-10](https://user-images.githubusercontent.com/36077702/170822483-e2b44c4f-3e37-4577-8c8a-1d9ff5d80002.png)
### You can access the application here: https://decentralized-lottery.vercel.app/
*To interact with the app you will need a wallet connected to the **mumbai** testnet.

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