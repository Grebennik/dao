import { Context } from "@aragon/sdk-client";
import { Web3Storage } from 'web3.storage';

export async function uploadToIpfs(context: Context, data: any): Promise<string> {
  try {
    console.log("Uploading to IPFS via Web3.Storage...");
    
    // Get token from environment
    const token = process.env.WEB3STORAGE_TOKEN;
    if (!token) {
      throw new Error("WEB3STORAGE_TOKEN not set in environment");
    }

    // Create Web3.Storage client
    const client = new Web3Storage({ token });
    
    // Convert data to JSON and create a File object
    const content = JSON.stringify(data);
    const files = [
      new File([content], 'metadata.json', { type: 'application/json' })
    ];
    
    // Upload content
    const cid = await client.put(files);
    
    const ipfsUri = `ipfs://${cid}`;
    console.log("IPFS Upload Successful");
    console.log("Content Hash:", cid);
    console.log("IPFS URI:", ipfsUri);
    
    return ipfsUri;
    
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw error;
  }
}