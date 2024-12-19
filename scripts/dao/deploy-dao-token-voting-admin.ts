// DAO Deployment Script with Token Voting and Admin Plugins

import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  DaoMetadata,
  TokenVotingClient,
  TokenVotingPluginInstall,
  VotingMode,
} from "@aragon/sdk-client";
import { GasFeeEstimation } from "@aragon/sdk-client-common";
import { createContext } from "../utils/context";
import { ethers } from "ethers"; // For ABI encoding

async function main() {
  try {
    // Instantiate the general-purpose client from the Aragon OSx SDK context.
    const context = await createContext();
    const client = new Client(context);

    const metadata: DaoMetadata = {
      name: "Token Voting DAO123 | Mirko",
      description: "This is a description",
      links: [{
        name: "Web site",
        url: "https://...",
      }],
    };

    // Pin the metadata in IPFS to get the IPFS URI.
    console.log('START');
    const metadataUri = await client.methods.pinMetadata(metadata);
    console.log('END');
    // Define Token Voting plugin installation parameters.
    const tokenVotingPluginInstallParams: TokenVotingPluginInstall = {
      votingSettings: {
        minDuration: 60 * 60 * 24 * 2, // seconds
        minParticipation: 0.25, // 25%
        supportThreshold: 0.5, // 50%
        minProposerVotingPower: BigInt(0), // default 0
        votingMode: VotingMode.EARLY_EXECUTION, // other options: STANDARD, VOTE_REPLACEMENT
      },
      newToken: {
        name: "admTo22k", // the name of your token
        symbol: "1admTo22k", // the symbol for your token. shouldn't be more than 5 letters
        decimals: 18, // the number of decimals your token uses
        minter: "0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50", // optional. if not defined, a standard OZ ERC20 contract is used
        balances: [
          {
            // Defines the initial balances of the new token
            address: "0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50", // address to receive the newly minted tokens
            balance: BigInt("50000000000000000"), // amount of tokens
          },
        ],
      },
    };

    // Create Token Voting plugin install item.
    const tokenVotingInstallItem = TokenVotingClient.encoding.getPluginInstallItem(
      tokenVotingPluginInstallParams,
      "sepolia"
    );

    /**
     * Admin Plugin Installation Parameters
     *
     * Using the Admin plugin's implementation and setup contract addresses provided by you:
     * - Implementation Address: 0x4C049cAD4DB7FDcaC4c1D01F35cE926808087364
     * - Setup Address: 0xcA3351a2E293CCb822370D9481a44e7332c54242
     */

    const ADMIN_PLUGIN_IMPLEMENTATION = "0x4C049cAD4DB7FDcaC4c1D01F35cE926808087364";
    const ADMIN_PLUGIN_SETUP = "0xcA3351a2E293CCb822370D9481a44e7332c54242";

    // Define a minimal ABI with only the initialize function
    const adminSetupABI = [
      "function initialize(address admin)"
    ];

    // Create an Interface instance
    const adminInterface = new ethers.utils.Interface(adminSetupABI);

    // Replace with your admin address
    const adminAddress = "0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50";

    // Encode the calldata for initialize(adminAddress)
    const setupCalldata = adminInterface.encodeFunctionData("initialize", [adminAddress]);

    // Convert the calldata hex string to Uint8Array
    const setupCalldataBytes = ethers.utils.arrayify(setupCalldata);

    // Convert the implementation address to Uint8Array
    const implementationBytes = ethers.utils.arrayify(ADMIN_PLUGIN_SETUP);

    // Combine implementation address and setup calldata
    const adminPluginData = ethers.utils.concat([
      implementationBytes,
      setupCalldataBytes
    ]);

    // Define a unique ID for the Admin Plugin
    const ADMIN_PLUGIN_ID = "admin-plugin"; // Ensure this ID is unique within your DAO's context

    // Create a PluginInstallItem for the Admin Plugin
    const adminPluginInstallItem = {
      id: ADMIN_PLUGIN_ID, // Unique identifier
      data: adminPluginData, // Uint8Array containing the implementation address and setup calldata
    };

    // Combine both plugins into the plugins array.
    const createDaoParams: CreateDaoParams = {
      metadataUri,
      ensSubdomain: "my-mirkoada2", // Example: my-org.dao.eth
      plugins: [tokenVotingInstallItem, adminPluginInstallItem], // Include both Token Voting and Admin plugins
    };

    // Estimate the gas fee for creating the DAO.
    const estimatedGas: GasFeeEstimation = await client.estimation.createDao(
      createDaoParams
    );
    console.log({ avg: estimatedGas.average, maximum: estimatedGas.max });

    // Create the DAO with the specified plugins.
    const steps = client.methods.createDao(createDaoParams);

    for await (const step of steps) {
      try {
        switch (step.key) {
          case DaoCreationSteps.CREATING:
            console.log({ txHash: step.txHash });
            break;
          case DaoCreationSteps.DONE:
            console.log({
              daoAddress: step.address,
              pluginAddresses: step.pluginAddresses,
            });
            break;
        }
      } catch (err) {
        console.error(err);
      }
    }
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
