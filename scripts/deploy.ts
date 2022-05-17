import  {ethers} from 'hardhat'
import { FEE, VRF_COORDINATOR, LINK_TOKEN, KEY_HASH } from "../constants/deploy"

async function main() {

	const Lottery = await ethers.getContractFactory("Lottery");
	const lottery = await Lottery.deploy(
		VRF_COORDINATOR,
		LINK_TOKEN,
		KEY_HASH,
		FEE
	);
	await lottery.deployed();




	console.log(
		"Lottery Address:",
		lottery.address
	);

	// await sleep(10**3 * 60);

	// await hre.run("verify:verify", {
	// 	address: lottery.address,
	// 	constructorArguments: [VRF_COORDINATOR, LINK_TOKEN, KEY_HASH, FEE],
	// });
}

// function sleep(ms: number) {
// 	return new Promise((resolve) => setTimeout(resolve, ms));
// }

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});