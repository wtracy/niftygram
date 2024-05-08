import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers } from "ethers";

// Address of the contract to interact with
const CONTRACT_ADDRESS = "0x63c7dB0A8c67F2dd332E99dAF6f9dd8968838Ed9";
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
  const response = await contract.mint(wallet.address);
  console.log(`Current message is: ${response}`);
}
