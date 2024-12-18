// scripts/create-dao-with-admin.ts

import {
    Client,
    CreateDaoParams,
    DaoCreationSteps,
    DaoMetadata,
    AddresslistVotingClient,
    AddresslistVotingPluginInstall,
    VotingMode,
  } from "@aragon/sdk-client";
  import {
    PrepareInstallationParams,
    ApplyInstallationParams,
    DaoAction,
    PrepareInstallationStep,
    MetadataAbiInput,
    GasFeeEstimation,
  } from "@aragon/sdk-client-common";
  import { ethers } from "ethers";
  import "dotenv/config";
  import { createContext } from "./utils/context";
  
  // Import dotenv to access environment variables
  import { config as dotenvConfig } from "dotenv";
  dotenvConfig();
  
  async function main() {
    try {
      // Instantiate the general purpose client from the Aragon OSx SDK context.
      const context = await createContext();
      const client: Client = new Client(context);
  
      // 1. Define DAO metadata
      const metadata: DaoMetadata = {
        name: "Address Voting DAO - NEW wadmin | Mirko",
        description: "This is a description2",
        links: [
          {
            name: "Web site1",
            url: "https://..2.",
          },
        ],
      };
  
      // 2. Pin metadata to IPFS and get the URI
      const metadataUri = await client.methods.pinMetadata(metadata);
  
      // 3. Define AddresslistVoting Plugin installation parameters
      const addresslistVotingPluginInstallParams: AddresslistVotingPluginInstall = {
        addresses: ["0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50"], // Admin address
        votingSettings: {
          minDuration: 60 * 60 * 24 * 2, // seconds (2 days)
          minParticipation: 0.25, // 25%
          supportThreshold: 0.5, // 50%
          minProposerVotingPower: BigInt(0), // default 0
          votingMode: VotingMode.STANDARD, // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
        },
      };
  
      const addresslistVotingPluginInstallItem = AddresslistVotingClient.encoding.getPluginInstallItem(
        addresslistVotingPluginInstallParams,
        "sepolia"
      );
  
      // 4. Define Admin Plugin installation parameters
      const adminPluginRepoAddress = "0xDBe9bECBC2Cd3DF85d803A738f5b96F5cBC17ca7"; // Your deployed PluginRepo
      const adminSetupAddress = "0xcA3351a2E293CCb822370D9481a44e7332c54242"; // Your deployed AdminSetup
      const adminAddress = "0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50"; // The address to be granted admin rights
  
      // Validate admin address
      try {
        ethers.utils.getAddress(adminAddress);
      } catch (error) {
        console.error("Invalid admin address provided.");
        process.exit(1);
      }
  
      // Encode the admin address as initialization data
      const initDataBytes = ethers.utils.defaultAbiCoder.encode(["address"], [adminAddress]);
      console.log(`Encoded Admin Address (initDataBytes): ${initDataBytes}`);
  
      // Define the semantic version matching the AdminSetup plugin
      // Ensure this matches the version under which AdminSetup was registered in PluginRepo
      const adminSemanticVersion = { release: 1, minor: 0, patch: 0, build: 1 }; // Example: 1.0.0
      console.log(`Admin Plugin Semantic Version: ${JSON.stringify(adminSemanticVersion)}`);
  
      // Define the installation ABI for Admin plugin
      const adminInstallationAbi: MetadataAbiInput[] = [
        {
          name: "initData",
          type: "bytes",
          internalType: "bytes",
          description: "Initialization data for the Admin plugin",
          components: [],
        },
      ];
  
      // Prepare the Admin plugin installation parameters
      const adminPrepareParams: PrepareInstallationParams = {
        daoAddressOrEns: "", // Placeholder, will be replaced after DAO creation
        pluginRepo: adminPluginRepoAddress,
        version: adminSemanticVersion,
        installationParams: [initDataBytes],
        installationAbi: adminInstallationAbi,
      };
  
      // 5. Define DAO creation parameters including both plugins
      const createDaoParams: CreateDaoParams = {
        metadataUri,
        ensSubdomain: "4tok-mirko4", // Example ENS subdomain: my-org.dao.eth
        plugins: [addresslistVotingPluginInstallItem], // Initially add AddresslistVoting plugin
      };
  
      // Estimate gas for DAO creation
      const estimatedGasAddressVoting: GasFeeEstimation = await client.estimation.createDao(createDaoParams);
      console.log({ estimatedGasAddressVoting });
  
      // Create the DAO
      console.log("Creating the DAO...");
      const steps = client.methods.createDao(createDaoParams);
  
      let daoAddress = "";
      for await (const step of steps) {
        try {
          switch (step.key) {
            case DaoCreationSteps.CREATING:
              console.log({ txHash: step.txHash });
              break;
            case DaoCreationSteps.DONE:
              daoAddress = step.address;
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
  
      if (!daoAddress) {
        throw new Error("DAO creation failed.");
      }
  
      // 6. Update Admin plugin installation parameters with the new DAO address
      adminPrepareParams.daoAddressOrEns = daoAddress;
  
      // 7. Prepare the Admin plugin installation
      console.log("Preparing Admin plugin installation...");
      const adminPrepareSteps = client.methods.prepareInstallation(adminPrepareParams);
  
      let adminApplyParams: ApplyInstallationParams | undefined;
  
      for await (const step of adminPrepareSteps) {
        console.log(`Admin Preparation step: ${step.key}`);
        if (step.key === PrepareInstallationStep.DONE) {
          adminApplyParams = step as ApplyInstallationParams;
          console.log("Admin plugin preparation done, ready to apply installation.");
        }
      }
  
      if (!adminApplyParams) {
        throw new Error("Failed to prepare installation for the Admin plugin.");
      }
  
      // 8. Generate DAO actions to apply the Admin plugin installation
      const adminActions: DaoAction[] = client.encoding.applyInstallationAction(daoAddress, adminApplyParams);
      console.log("Admin Plugin installation actions:", adminActions);
  
      // 9. Execute the Admin plugin installation actions
      const signer = context.signer;
  
      // Optional: Verify signer's address
      const signerAddress = await signer.getAddress();
      console.log(`Executing Admin plugin actions with signer: ${signerAddress}`);
  
      for (const action of adminActions) {
        try {
          // Validate action fields
          if (!action.to || !action.data) {
            throw new Error("Admin Action missing 'to' address or 'data' field.");
          }
  
          console.log(`Sending Admin transaction to: ${action.to}`);
  
          const tx = await signer.sendTransaction({
            to: action.to,
            value: ethers.BigNumber.from(action.value.toString() || "0"),
            data: ethers.utils.hexlify(action.data),
            // Optional: Specify a reasonable gas limit if necessary
            // gasLimit: 500000, // Example gas limit
          });
  
          console.log(`Executed Admin action to ${action.to}, txHash: ${tx.hash}`);
          await tx.wait();
          console.log(`Admin Transaction confirmed: ${tx.hash}`);
        } catch (error: any) {
          console.error(`Failed to execute Admin action to ${action.to}:`, error.message || error);
          process.exit(1);
        }
      }
  
      console.log("Admin plugin installation process completed successfully.");
      console.log("DAO setup with AddresslistVoting and Admin plugins is complete.");
  
    } catch (error) {
      console.error("\nError during DAO deployment and Admin plugin installation:");
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
  