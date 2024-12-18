// scripts/verify-plugin-version.ts

import { ethers } from "hardhat";

async function verifyPluginVersion() {
  const provider = ethers.provider;

  // Replace with your deployed PluginRepo address
  const pluginRepoAddress = "0xDBe9bECBC2Cd3DF85d803A738f5b96F5cBC17ca7";

  // ABI fragment for getVersionHash
  const pluginRepoABI = [
    "function getVersionHash(uint8 release, uint8 build, uint8 patch) external view returns (bytes32)"
  ];

  const pluginRepo = new ethers.Contract(pluginRepoAddress, pluginRepoABI, provider);

  // Specify the version you registered
  const release = 1;
  const build = 1;
  const patch = 0;

  try {
    const versionHash: string = await pluginRepo.getVersionHash(release, build, patch);
    if (versionHash === ethers.constants.HashZero) {
      console.error(`Version ${release}.${build}.${patch} does not exist in PluginRepo.`);
    } else {
      console.log(`VersionHash for ${release}.${build}.${patch}: ${versionHash}`);
    }
  } catch (error) {
    console.error("Error fetching version hash:", error);
  }
}

verifyPluginVersion().catch((error) => {
  console.error(error);
  process.exit(1);
});
