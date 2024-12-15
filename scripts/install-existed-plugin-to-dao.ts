import { Client, Context } from "@aragon/sdk-client";
import { createContext } from "./utils/context";
import { ethers } from "ethers";

async function main() {
  try {
    const context: Context = await createContext();
    const client: Client = new Client(context);

    const daoAddress = "0x6F41f9224286bA295FdE58F660b7B72B9b40A9Df"; // DAO Address
    const membershipPluginSetupAddress = "0x2B5EF79e976B9ea8B5B28ba558C23EDa69B9cFa9"; // MembershipPluginSetup Address

    const initialMembers = ["0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50"]; // Replace with actual members
    const installationData = ethers.utils.defaultAbiCoder.encode(["address[]"], [initialMembers]);
    console.log("Encoded installation data:", installationData);

    const membershipPluginSetupABI = [
      "function prepareInstallation(address _dao, bytes memory _data) external returns (address plugin, (address, bytes[] memory) permissions)"
    ];
    const signer = context.signer;
    const membershipPluginSetup = new ethers.Contract(
      membershipPluginSetupAddress,
      membershipPluginSetupABI,
      signer
    );

    console.log("Calling prepareInstallation...");
    const tx = await membershipPluginSetup.prepareInstallation(daoAddress, installationData, {
      gasLimit: ethers.utils.hexlify(10000000),
    });
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);

    const pluginAddress = receipt.logs[0]?.address || ethers.constants.AddressZero;
    console.log("Deployed Plugin Address:", pluginAddress);

    if (!pluginAddress || pluginAddress === ethers.constants.AddressZero) {
      throw new Error("Plugin deployment failed or plugin address is undefined.");
    }

    console.log("Plugin installed successfully!");
  } catch (error) {
    console.error("Error during plugin installation:", error);
    if (error) {
      console.log("Failed transaction hash:", error);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unexpected error:", error.message || error);
    process.exit(1);
  });
