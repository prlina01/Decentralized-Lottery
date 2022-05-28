import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, LOTTERY_CONTRACT_ADDRESS } from '../constants';
import { FETCH_CREATED_GAME } from "../queries";
import styles from "../styles/Home.module.css";
import { subgraphQuery } from "../utils";
import {JsonRpcSigner} from "@ethersproject/providers";
import {Button, Card, Col, Container, Row, Spacer, Text} from "@nextui-org/react";

export default function Home() {
	const zero = BigNumber.from("0");
	const [walletConnected, setWalletConnected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isOwner, setIsOwner] = useState(false);
	const [entryFee, setEntryFee] = useState(zero);
	const [maxPlayers, setMaxPlayers] = useState(0);
	const [gameStarted, setGameStarted] = useState(false);
	const [players, setPlayers] = useState<string[]>([]);
	const [winner, setWinner] = useState();
	const [logs, setLogs] = useState<string[]>([]);
	const web3ModalRef = useRef<Web3Modal>(Web3Modal.prototype);
	const addressRef = useRef<string>("");
	const isMetamaskRef = useRef(true)


	// This is used to force react to rerender the page when we want to
	// in our case we will use force update to show new logs
	const forceUpdate = React.useReducer(() => ({}), {})[1];

	const connectWallet = async () => {
		try {
			await getProviderOrSigner();
			setWalletConnected(true);
		} catch (err) {
			console.error(err);
		}
	};
	const getProviderOrSigner = async (needSigner = false) => {
		// Connect to Metamask
		// Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
		const provider = await web3ModalRef.current.connect();
		const web3Provider = new providers.Web3Provider(provider);

		// If user is not connected to the Mumbai network, let them know and throw an error
		const { chainId } = await web3Provider.getNetwork();
		if (chainId !== 80001) {
			window.alert("Change the network to Mumbai");
			throw new Error("Change network to Mumbai");
		}

		if (needSigner) {
			const signer = web3Provider.getSigner();
			return signer;
		}
		return web3Provider;
	};

	/**
	 * startGame: Is called by the owner to start the game
	 */
	const startGame = async () => {
		try {
			// Get the signer from web3Modal, which in our case is MetaMask
			// No need for the Signer here, as we are only reading state from the blockchain
			const signer = await getProviderOrSigner(true);
			// We connect to the Contract using a signer because we want the owner to
			// sign the transaction
			const randomGameNFTContract = new Contract(
				LOTTERY_CONTRACT_ADDRESS,
				abi,
				signer
			);
			setLoading(true);
			// call the startGame function from the contract
			const tx = await randomGameNFTContract.startGame(maxPlayers, entryFee);
			await tx.wait();
			setLoading(false);
		} catch (err) {
			console.error(err);
			setLoading(false);
		}
	};

	/**
	 * startGame: Is called by a player to join the game
	 */
	const joinGame = async () => {
		try {
			// Get the signer from web3Modal, which in our case is MetaMask
			// No need for the Signer here, as we are only reading state from the blockchain
			const signer = await getProviderOrSigner(true);
			// We connect to the Contract using a signer because we want the owner to
			// sign the transaction
			const randomGameNFTContract = new Contract(
				LOTTERY_CONTRACT_ADDRESS,
				abi,
				signer
			);
			setLoading(true);
			// call the startGame function from the contract
			const tx = await randomGameNFTContract.joinGame({
				value: entryFee,
			});
			await tx.wait();
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	/**
	 * checkIfGameStarted checks if the game has started or not and intializes the logs
	 * for the game
	 */
	const checkIfGameStarted = async () => {
		try {
			const provider = await getProviderOrSigner();
			const randomGameNFTContract = new Contract(
				LOTTERY_CONTRACT_ADDRESS,
				abi,
				provider
			);

			// read the gameStarted boolean from the contract
			const _gameStarted = randomGameNFTContract.gameStarted()
			// console.log(_gameStarted)
			const _gameArray = await subgraphQuery(FETCH_CREATED_GAME());

			const _game = _gameArray.games[0];

			let _logs: string[] = [];

			// Initialize the logs array and query the graph for current gameID
			if (_gameStarted) {
				_logs = [] || _game.id && [`Game has started with ID: ${_game.id}`];
				if (_game.players && _game.players.length > 0) {
					_logs.push(
						`${_game.players.length} / ${_game.maxPlayers} already joined 👀 `
					);
					_game.players.forEach((player: any) => {
						let slicedPlayer = player.slice(0, Math.floor(player.length/2) - 10) +
							"..." + player.slice(Math.floor(player.length)/2 + 10)
						_logs.push(`${slicedPlayer} joined 🏃‍♂️`);
					});
				}
				setEntryFee(BigNumber.from(_game.entryFee));
				setMaxPlayers(_game.maxPlayers);
			} else if (!gameStarted && _game.winner) {
				_logs = [
					`Last game has ended with ID: ${_game.id}`,
					`Winner is: ${_game.winner} 🎉 `,
					`Waiting for host to start new game....`,
				];

				setWinner(_game.winner);
			}
			setLogs(_logs);
			setPlayers(_game.players);
			setGameStarted(_gameStarted);
			forceUpdate();
		} catch (error) {
			console.error(error);
		}
	};


	const getOwner = async () => {
		try {
			const provider = await getProviderOrSigner();
			const randomGameNFTContract = new Contract(
				LOTTERY_CONTRACT_ADDRESS,
				abi,
				provider
			);
			const _owner = await randomGameNFTContract.owner();

			const signer = await getProviderOrSigner(true);
			const address = signer instanceof JsonRpcSigner && await signer.getAddress();
			if (address !== false) {
				addressRef.current = address.toLowerCase()
				if(address.toLowerCase() === _owner.toLowerCase())
					setIsOwner(true)
			}
		} catch (err: any) {
			console.error(err.message);
		}
	};

	useEffect(() => {
		if (!walletConnected) {
			if(typeof window.ethereum == "undefined") {
				alert('No wallet installed in the browser! You cant interact with the app!')
				return
			}
				web3ModalRef.current = new Web3Modal({
				network: "mumbai",
				providerOptions: {},
				disableInjectedProvider: false,
			});
			// void connectWallet();

			void getOwner();
			void checkIfGameStarted();
			// setInterval(() => {
			// 	void checkIfGameStarted();
			// }, 2000);
		}
	}, [walletConnected]);

	/*
	  renderButton: Returns a button based on the state of the dapp
	*/
	const renderButton = () => {
		if(!isMetamaskRef.current) return <Button css={{mt: '10vh'}} disabled={true}>No wallet installed in your browser!</Button>
		// If wallet is not connected, return a button which allows them to connect their wallet
		if (!walletConnected) {
			return (
				<Button css={{mt: '10vh'}} color={'success'} onClick={connectWallet}>
					Connect your wallet
				</Button>
			);
		}

		// If we are currently waiting for something, return a loading button
		if (loading) {
			return <button className={styles.button}>Loading...</button>;
		}
		// Render when the game has started
		if (gameStarted) {
			if (players.length === maxPlayers) {
				return (
					<Button css={{mt: '10vh'}} color={'success'} disabled>
						Choosing winner...
					</Button>
				);
			}
			if(players.includes(addressRef.current)) {
				return (
					<>
					<Text color={'white'}  h3 size={28} css={{mb: '1vh'}}>
							You have already joined the lottery! 🚀
						</Text>
					</>
				)
			}
			return (
				<div>
					<button className={styles.button} onClick={joinGame}>
						Join Game 🚀
					</button>
				</div>
			);
		}
		// Start the game
		if (isOwner && !gameStarted) {
			return (
				<div>
					<input
						type="number"
						className={styles.input}
						onChange={(e) => {
							// The user will enter the value in ether, we will need to convert
							// it to WEI using parseEther
							setEntryFee(
								Number(e.target.value) >= 0
									? utils.parseEther(e.target.value.toString())
									: zero
							);
						}}
						placeholder="Entry Fee (ETH)"
					/>
					<input
						type="number"
						className={styles.input}
						onChange={(e) => {
							// The user will enter the value in ether, we will need to convert
							// it to WEI using parseEther
							setMaxPlayers(Number(e.target.value) ?? 0);
						}}
						placeholder="Max players"
					/>
					<button className={styles.button} onClick={startGame}>
						Start Game 🚀
					</button>
				</div>
			);
		}
	};

	return (
		<div>
			<Head>
				<title>Lottery</title>
				<meta name="description" content="Lottery Dapp" />
				<link rel="icon" href="" />
			</Head>
			<div className={styles.hideOnDesktop}>
				<Spacer y={2}  />
			</div>
			<div className={styles.hideOnMobile}>
				<Spacer y={7}  />
			</div>
			<Container md>
				<Card css={{bgColor: "#2d98da"}}>
					<Row justify="center" align="center">
						<Col>
							<div className={styles.hideOnMobile}>
								<Text h1
									  size={55}
									  css={{
										  textGradient: "45deg, $blue600 -20%, $purple600 50%",
										  mb: '1vh',
										  textAlign: 'center'
									  }}
									  weight="bold">Decentralized Lottery
								</Text>
							</div>
							<div className={styles.hideOnDesktop}>
								<Text h1
									  size={40}
									  css={{
										  textGradient: "45deg, $blue600 -20%, $purple600 50%",
										  mb: '1vh',
										  textAlign: 'center'
									  }}
									  weight="bold">Decentralized Lottery
								</Text>
							</div>
							<Text  h3 size={25} css={{mb: '10vh'}}>
								Join this grandiose lottery for a chance to win big!
							</Text>
							{renderButton()}
							<Spacer y={2}></Spacer>
							{logs &&
								logs.map((log, index) => (
									<>
										<div className={styles.hideOnDesktop}>
											<Text color={'white'}  h3 size={20} css={{mb: '1vh'}}  key={index}>
												{log}
											</Text>
										</div>
										<div className={styles.hideOnMobile}>
											<Text color={'white'}  h3 size={25} css={{mb: '1vh'}}  key={index}>
												{log}
											</Text>
										</div>
									</>
								))}
						</Col>
						<Col className={styles.hideOnMobile}>
							<img alt="ALT" src="/crypto-devs.svg"  />
						</Col>
					</Row>

				</Card>
			</Container>
		</div>
	);
}