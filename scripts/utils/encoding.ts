import { ethers } from "hardhat";

export function encodePluginInstallData(memberAddresses: string[]): Uint8Array {
  // Validate all addresses
  memberAddresses.forEach(validateAddress);
  
  // Encode the array of addresses directly
  const initData = ethers.utils.defaultAbiCoder.encode(
    ["address[]"],
    [memberAddresses]
  );
  
  return ethers.utils.arrayify(initData);
}

function validateAddress(address: string) {
  if (!ethers.utils.isAddress(address)) {
    throw new Error(`Invalid address: ${address}`);
  }
  if (address === ethers.constants.AddressZero) {
    throw new Error("Address cannot be zero address");
  }
}