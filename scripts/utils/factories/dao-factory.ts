import { ethers } from "hardhat";
import { DAOFactory__factory } from "@aragon/osx-ethers";
import { DaoSettings } from "../types";

// Sepolia DAO Factory address from Aragon OSx
const DAO_FACTORY_ADDRESS = "0x16B6c6674fEf5d29C9a49EA68A19944f5a8471D3";

export async function createDaoFactory() {
  const [signer] = await ethers.getSigners();
  return DAOFactory__factory.connect(DAO_FACTORY_ADDRESS, signer);
}