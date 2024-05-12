import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers } from "ethers";

// Address of the contract to interact with
const CONTRACT_ADDRESS = "0x684f6198a91df930da7f079749e20448ce9d4d1c";
if (!CONTRACT_ADDRESS) throw "⛔️ Provide address of the contract to interact with!";

// An example of a script to interact with the contract
export default async function () {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact("ERC721Mock");
  const wallet = getWallet();

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    wallet // Interact with the contract on behalf of this wallet
  );

  // Run contract read function
  console.log(wallet.address);
  const response = await contract.safeTransferFrom(wallet.address, '0x633c38E744F6A1F39cf12DeaD8fEEf368A6Aa255', 197);
  console.log(`Current message is: ${response}`);
}
