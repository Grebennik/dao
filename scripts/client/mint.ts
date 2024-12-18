import { Client } from "@aragon/sdk-client";
import { createContext } from "../utils/context";
import { ethers } from "ethers";

async function main() {
  // Set up the Aragon SDK context and client
  const context = await createContext();
  const client = new Client(context);

  // Replace with your token's deployed address. You can find this from the DAO creation output.
  const tokenAddress = "0xa43d43fff9d72ea15a5fc1e8cc2bc232f1614a4a";

  // The ABI for a standard ERC20 with a mint function
  const tokenABI = [
    "function mint(address to, uint256 amount) external"
  ];

  // Create a contract instance with the signer that deployed the DAO
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, context.signer);

  // Mint 1000 tokens (assuming 18 decimals)
  const amount = ethers.utils.parseUnits("1000", 18);
  const tx = await tokenContract.mint("0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50", amount);
  await tx.wait();

  console.log("Successfully minted 1000 tokens to 0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
