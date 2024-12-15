/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IPluginRepository,
  IPluginRepositoryInterface,
} from "../../../contracts/interfaces/IPluginRepository";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_name",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_pluginSetup",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_buildMetadata",
        type: "bytes",
      },
    ],
    name: "createVersion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_name",
        type: "bytes32",
      },
    ],
    name: "latestVersion",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "pluginSetup",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "buildMetadata",
            type: "bytes",
          },
        ],
        internalType: "struct IPluginRepository.Version",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IPluginRepository__factory {
  static readonly abi = _abi;
  static createInterface(): IPluginRepositoryInterface {
    return new utils.Interface(_abi) as IPluginRepositoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IPluginRepository {
    return new Contract(address, _abi, signerOrProvider) as IPluginRepository;
  }
}