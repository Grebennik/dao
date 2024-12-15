import { ethers } from "hardhat";
import { Contract } from "ethers";

export async function deployContract(
  name: string,
  args: any[] = []
): Promise<Contract> {
  console.log(`Deploying ${name}...`);
  const Factory = await ethers.getContractFactory(name);
  const contract = await Factory.deploy(...args);
  await contract.deployed();
  console.log(`${name} deployed to: ${contract.address}`);
  return contract;
}

export async function verifyConsole(
  address: string,
  args: any[] = []
): Promise<void> {
  console.log(`Verify with:
    npx hardhat verify --network sepolia ${address} ${args.join(" ")}
  `);
}