import { 
  Client, 
  CreateDaoParams,
  DaoCreationSteps
} from "@aragon/sdk-client";
import { ethers } from "hardhat";
import { DaoCreationParams, DaoCreationResult } from "./types";
import { encodePluginInstallData } from "./encoding";
import { uploadToIpfs } from "./storage/ipfs";
import { createDaoMetadata } from "./metadata";

export async function createDao({
  context,
  pluginSetupAddress,
  daoName,
  daoDescription,
  daoEnsName
}: DaoCreationParams): Promise<DaoCreationResult> {
  const client = new Client(context);
  const [deployer] = await ethers.getSigners();
  
  console.log("\nInitializing DAO creation:");
  console.log("- Name:", daoName);
  console.log("- ENS:", daoEnsName);
  console.log("- Plugin Setup:", pluginSetupAddress);
  console.log("- Deployer:", deployer.address);

  try {
    // Prepare metadata
    const metadata = createDaoMetadata(daoName, daoDescription);
    const metadataUri = await uploadToIpfs(context, metadata);

    // Encode plugin data - array of addresses for initial members
    const pluginInstallData = encodePluginInstallData([deployer.address]);

    // Create DAO parameters
    const createDaoParams: CreateDaoParams = {
      metadataUri,
      ensSubdomain: daoEnsName,
      plugins: [
        {
          id: pluginSetupAddress,
          data: pluginInstallData
        }
      ]
    };

    // Create DAO
    console.log("\nDeploying DAO...");
    const steps = client.methods.createDao(createDaoParams);
    
    let daoAddress: string | undefined;
    let pluginAddresses: string[] | undefined;

    for await (const step of steps) {
      switch (step.key) {
        case DaoCreationSteps.CREATING:
          console.log("Transaction submitted...");
          break;
        case DaoCreationSteps.DONE:
          daoAddress = step.address;
          pluginAddresses = step.pluginAddresses;
          console.log("DAO deployed successfully!");
          break;
      }
    }

    if (!daoAddress || !pluginAddresses) {
      throw new Error("DAO creation failed - missing address or plugins");
    }

    return {
      daoAddress,
      pluginAddresses,
      daoUrl: `https://sepolia.client.aragon.org/#/daos/${daoAddress}`
    };

  } catch (err) {
    console.error("Error creating DAO:", err);
    throw err;
  }
}