import { ethers } from "hardhat";
import { deployContract, verifyConsole } from "./utils/deployment";

async function main() {
  const membershipPluginSetup = await deployContract("MembershipPluginSetup");
  await verifyConsole(membershipPluginSetup.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });