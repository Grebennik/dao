import { ethers } from "hardhat";
import { IPluginRepository__factory } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Aragon OSx Plugin Repository Contract Address on Sepolia
  const pluginRepoAddress = "0x24f90967bf1a776499ae54fab4a9d8dab60bf699";
  
  // Get plugin setup address from environment
  const pluginSetupAddress = process.env.PLUGIN_SETUP_ADDRESS;
  if (!pluginSetupAddress) {
    throw new Error("PLUGIN_SETUP_ADDRESS not set in environment");
  }

  try {
    console.log("Publishing plugin...");
    console.log("Plugin Setup Address:", pluginSetupAddress);
    
    // Connect to the Plugin Repository contract
    const pluginRepo = IPluginRepository__factory.connect(
      ethers.utils.getAddress(pluginRepoAddress),
      deployer
    );

    // Prepare version metadata
    const buildMetadata = {
      name: "Membership Plugin",
      description: "A plugin for managing DAO membership",
      version: "1.0.0",
      maintainers: [deployer.address],
      tags: ["membership", "governance"]
    };

    // Publication parameters
    const pluginName = ethers.utils.formatBytes32String("membership");
    const encodedMetadata = ethers.utils.toUtf8Bytes(JSON.stringify(buildMetadata));

    // Create plugin version
    const tx = await pluginRepo.createVersion(
      pluginName,
      pluginSetupAddress,
      encodedMetadata,
      { gasLimit: 500000 }
    );

    console.log("Transaction submitted. Waiting for confirmation...");
    const receipt = await tx.wait();

    console.log("\nPlugin Publication Details:");
    console.log("-------------------------");
    console.log("Transaction Hash:", receipt.transactionHash);

    // No need to verify the latest version since the transaction succeeded
    console.log("\nPlugin successfully published!");

  } catch (error) {
    console.error("\nError publishing plugin:");
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });