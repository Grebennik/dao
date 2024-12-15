import { Context, ContextParams } from "@aragon/sdk-client";
import { ethers } from "hardhat";
import { SupportedNetworks } from "@aragon/osx-commons-configs";
import { Wallet } from "@ethersproject/wallet";
import { SigningKey, computePublicKey } from "@ethersproject/signing-key";
import { JsonRpcProvider } from '@ethersproject/providers'

export async function createContext(): Promise<Context> {
  const provider = new JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
  const [signer] = await ethers.getSigners();

  if (!process.env.INFURA_PROJECT_ID) {
    throw new Error("INFURA_PROJECT_ID not set in environment");
  }


  const minimalContextParams: ContextParams = {
    network: SupportedNetworks.SEPOLIA,
    web3Providers: [`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`],
    // This is the signer account who will be signing transactions for your app. You can use also use a specific account where you have funds, through passing it `new Wallet("your-wallets-private-key")` or pass it in dynamically when someone connects their wallet to your dApp.
    signer: signer,
  };


  return new Context(minimalContextParams);


}