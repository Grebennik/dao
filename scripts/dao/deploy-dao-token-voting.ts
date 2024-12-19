// Token Voting DAO - "general payment token"
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

async function main() {
  try {
    // Instantiate the general purpose client from the Aragon OSx SDK context.
    const context = await createContext();
    const client: Client = new Client(context);

    const metadata: DaoMetadata = {
      name: "Test DAO | Mirko77",
      description: "This is a 777",
      links: [{
        name: "Web site",
        url: "https://..",
      }],
    };

    // Through pinning the metadata in IPFS, we can get the IPFS URI. You can read more about it here: https://docs.ipfs.tech/how-to/pin-files/
    const metadataUri = await client.methods.pinMetadata(metadata);


    // You need at least one plugin in order to create a DAO. In this example, we'll use the TokenVoting plugin, but feel free to install whichever one best suites your needs. You can find resources on how to do this in the plugin sections.
    // These would be the plugin params if you need to mint a new token for the DAO to enable TokenVoting.
    const tokenVotingPluginInstallParams: TokenVotingPluginInstall = {
      votingSettings: {
        minDuration: 300, // seconds
        minParticipation: 0.25, // 25%
        supportThreshold: 0.5, // 50%
        minProposerVotingPower: BigInt(0), // default 0
        votingMode: VotingMode.EARLY_EXECUTION, // default is STANDARD. other options: EARLY_EXECUTION, VOTE_REPLACEMENT
      },
      newToken: {
        name: "8TOKENS", // the name of your token
        symbol: "78TOK", // the symbol for your token. shouldn't be more than 5 letters
        decimals: 18, // the number of decimals your token uses
        minter: "0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50", // optional. if you don't define any, we'll use the standard OZ ERC20 contract. Otherwise, you can define your own token minter contract address.
        balances: [
          { // Defines the initial balances of the new token
            address: "0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50", // address of the account to receive the newly minted tokens
            balance: BigInt("5"), // amount of tokens that address should receive
          },
        ],
      },
    };

    // Creates a TokenVoting plugin client with the parameteres defined above (with an existing token).
    const tokenVotingInstallItem = TokenVotingClient.encoding
      .getPluginInstallItem(tokenVotingPluginInstallParams, "sepolia");

    const createDaoParams: CreateDaoParams = {
      metadataUri,
      ensSubdomain: "1tok-mirko77789", // my-org.dao.eth
      plugins: [tokenVotingInstallItem], // plugin array cannot be empty or the transaction will fail. you need at least one governance mechanism to create your DAO.
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