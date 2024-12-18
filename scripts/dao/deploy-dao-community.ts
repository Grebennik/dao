// Membership/Community - address voting
import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  DaoMetadata,
  AddresslistVotingClient,
  AddresslistVotingPluginInstall,
  VotingMode,
} from "@aragon/sdk-client";
import { GasFeeEstimation } from "@aragon/sdk-client-common";
import { createContext } from "../utils/context";

async function main() {
  try {
    // Instantiate the general purpose client from the Aragon OSx SDK context.
    const context = await createContext();
    const client: Client = new Client(context);

    const metadata: DaoMetadata = {
      name: "Address Voting DAO | Mirko",
      description: "This is a description",
      links: [{
        name: "Web site",
        url: "https://...",
      }],
    };

    // Through pinning the metadata in IPFS, we can get the IPFS URI. You can read more about it here: https://docs.ipfs.tech/how-to/pin-files/
    const metadataUri = await client.methods.pinMetadata(metadata);

    const addresslistVotingPluginInstallParams: AddresslistVotingPluginInstall = {
      addresses: ["0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50"],
      votingSettings: {
        minDuration: 60 * 60 * 24 * 2, // seconds
        minParticipation: 0.25, // 25%
        supportThreshold: 0.5, // 50%
        minProposerVotingPower: BigInt(0), // default 0
        votingMode: VotingMode.STANDARD, // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
      }
    };

    const addresslistVotingPluginInstallItem = AddresslistVotingClient.encoding
    .getPluginInstallItem(addresslistVotingPluginInstallParams, "sepolia");

    const createDaoParams: CreateDaoParams = {
      metadataUri,
      ensSubdomain: "3tok-mirko3", // my-org.dao.eth
      plugins: [addresslistVotingPluginInstallItem], // plugin array cannot be empty or the transaction will fail. you need at least one governance mechanism to create your DAO.
    };

    // Estimate how much gas the transaction will cost.
    const estimatedGas: GasFeeEstimation = await client.estimation.createDao(
      createDaoParams,
    );
    console.log({ avg: estimatedGas.average, maximum: estimatedGas.max });

    // Create the DAO.
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