import { Context } from "@aragon/sdk-client";

export interface DaoCreationParams {
  context: Context;
  pluginSetupAddress: string;
  daoName: string;
  daoDescription: string;
  daoEnsName: string;
}

export interface DaoCreationResult {
  daoAddress: string;
  pluginAddresses: string[];
  daoUrl: string;
}

export interface DaoSettings {
  trustedForwarder: string;
  daoURI: string;
  subdomain: string;
  metadata: string;
}

export interface PluginInstallParams {
  pluginSetupRef: {
    versionTag: {
      release: number;
      build: number;
    };
    pluginSetupRepo: string;
  };
  data: string;
}