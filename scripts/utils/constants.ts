import { ethers } from "hardhat";

// Get permission IDs from the contract
export const MANAGE_MEMBERS_PERMISSION_ID = ethers.utils.id("MANAGE_MEMBERS_PERMISSION");

// Standard Aragon permission - this is a core permission used across all DAOs
export const EXECUTE_PERMISSION_ID = ethers.utils.id("EXECUTE_PERMISSION");

// Alchemy IPFS configuration
export const ALCHEMY_IPFS_URL = "https://ipfs.alchemy.com/api/v2/ipfs";

// Plugin repo addresses
export const PLUGIN_REPO_ADDRESS = "0x24f90967bf1a776499ae54fab4a9d8dab60bf699"; // Sepolia