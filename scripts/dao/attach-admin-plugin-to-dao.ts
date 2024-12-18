import { Client } from "@aragon/sdk-client";
import { PrepareInstallationParams, ApplyInstallationParams, DaoAction, PrepareInstallationStep, MetadataAbiInput } from "@aragon/sdk-client-common";
import { createContext } from "../utils/context";
import { ethers } from "ethers";

async function installAdminPlugin() {
  const context = await createContext();
  const client = new Client(context);

  // Your DAO address
  const daoAddress = "0xEB97BE5681F125acF584f707805fe2AB79388444";

  // Use the pluginRepo address from your previously deployed Admin plugin repo
  const adminPluginRepo = "0xDBe9bECBC2Cd3DF85d803A738f5b96F5cBC17ca7";

  // Replace this with an EOA address that you control. This address will become the admin.
  const ownerAddress = "0xDFbcefa92C1dfACA330fEaB08ee0FD6Eff9d6A50";

  // Encode the initialization data for the Admin plugin:
  // function initialize(address dao, address owner)
  // 'dao' is passed as zero address (will be replaced by actual DAO address during apply),
  // 'owner' is the admin EOA you provided above.
  const adminABI = ["function initialize(address dao, address owner)"];
  const adminInterface = new ethers.utils.Interface(adminABI);
  const initData = adminInterface.encodeFunctionData("initialize", [
    ethers.constants.AddressZero,
    ownerAddress,
  ]);
  const initDataBytes = ethers.utils.arrayify(initData);
  const installationAbi: MetadataAbiInput[] = [
    {
      name: "initData",
      type: "bytes",
      internalType: "bytes",
      description: "Initialization data for the plugin"
    }
  ];

  // Prepare the installation parameters
  const prepareParams: PrepareInstallationParams = {
    daoAddressOrEns: daoAddress,
    pluginRepo: adminPluginRepo,
    version: { 
      release: 1, 
      build: 1 
    },
    installationParams: [initDataBytes],
    installationAbi
  };

  let applyParams: ApplyInstallationParams | undefined;

  // Prepare the installation steps
  for await (const step of client.methods.prepareInstallation(prepareParams)) {
    if (step.key === PrepareInstallationStep.DONE) {
      // Once done, step contains the parameters needed to apply the plugin installation
      applyParams = step;
    }
  }

  if (!applyParams) {
    throw new Error("Failed to prepare installation for the Admin plugin.");
  }

  // Encode the DAO actions required to apply the plugin installation
  const actions: DaoAction[] = client.encoding.applyInstallationAction(daoAddress, applyParams);

  console.log("Plugin installation actions:", actions);

  // Next Steps:
  // - If you have the Admin plugin already installed and you are the admin, you can directly execute these actions on the DAO.
  // - Otherwise, use your DAO's governance process (e.g., create a proposal with these actions and execute it once passed).

  console.log("Propose these actions via your governance mechanism or execute them if you have the capability (e.g., Admin plugin).");
}

// Run the function
installAdminPlugin().catch((error) => {
  console.error(error);
  process.exit(1);
});
