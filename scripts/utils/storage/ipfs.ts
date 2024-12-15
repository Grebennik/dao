import { Client } from "@aragon/sdk-client";
import { Context } from "@aragon/sdk-client";

export async function uploadToIpfs(context: Context, data: any): Promise<string> {
  try {
    console.log("Uploading to IPFS...");
    
    // Create Aragon client
    const client = new Client(context);
    
    // Upload metadata using Aragon's client
    const metadataUri = await client.methods.pinMetadata(data);
    
    if (!metadataUri) {
      throw new Error("Failed to upload to IPFS");
    }
    
    console.log("IPFS Upload Successful");
    return metadataUri;
    
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw error;
  }
}