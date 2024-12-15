import { ethers } from "hardhat";
import { Client } from "@aragon/sdk-client";
import { DaoCreationSteps } from "@aragon/sdk-client";
import { createContext } from "./utils/context";
import { encodePluginInstallData } from "./utils/encoding";
import { createDaoMetadata } from "./utils/metadata";
import { generateEnsName } from "./utils/helpers";
import { DAO_CONFIG } from "./utils/config";
import { DaoCreationResult } from "./utils/types";

async function main() {
  try {
    console.log("Starting DAO deployment...");
    
    // Initialize context and client
    const [signer] = await ethers.getSigners();
    const context = await createContext();
    const client = new Client(context);

    // Generate unique ENS name
    const daoEnsName = generateEnsName("membership-dao");
    
    // Create metadata
    const metadata = createDaoMetadata(DAO_CONFIG.name, DAO_CONFIG.description);
    
    // Pin metadata to IPFS
    console.log("Uploading metadata to IPFS...");
    const metadataUri = await client.methods.pinMetadata(metadata);
    
    if (!metadataUri) {
      throw new Error("Failed to pin metadata to IPFS");
    }

    // Get plugin setup address
    const pluginSetupAddress = process.env.PLUGIN_SETUP_ADDRESS;
    if (!pluginSetupAddress) {
      throw new Error("PLUGIN_SETUP_ADDRESS not set in environment");
    }

    // Encode plugin installation data
    const pluginInstallData = encodePluginInstallData([signer.address]);

    // Log deployment parameters
    console.log("\nDeployment Parameters:");
    console.log("----------------------");
    console.log("DAO Name:", DAO_CONFIG.name);
    console.log("ENS Name:", daoEnsName);
    console.log("Plugin Setup:", pluginSetupAddress);
    console.log("Deployer:", signer.address);
    console.log("Metadata URI:", metadataUri);

    // Create DAO
    console.log("\nCreating DAO...");
    const createDaoSteps = await client.methods.createDao({
      ensSubdomain: daoEnsName,
      metadataUri,
      plugins: [{
        id: pluginSetupAddress,
        data: pluginInstallData
      }]
    });

    let result: DaoCreationResult | undefined;
    
    // Handle creation steps
    for await (const step of createDaoSteps) {
      switch (step.key) {
        case DaoCreationSteps.CREATING:
          console.log("Transaction submitted...");
          break;
        case DaoCreationSteps.DONE:
          result = {
            daoAddress: step.address,
            pluginAddresses: step.pluginAddresses,
            daoUrl: `https://sepolia.client.aragon.org/#/daos/${step.address}`
          };
          break;
      }
    }

    if (!result) {
      throw new Error("DAO creation failed - missing result data");
    }

    // Log success
    console.log("\nDeployment Successful!");
    console.log("----------------------");
    console.log("DAO Address:", result.daoAddress);
    console.log("Plugin Address:", result.pluginAddresses[0]);
    console.log("DAO URL:", result.daoUrl);

  } catch (error) {
    console.error("\nError during DAO deployment:");
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