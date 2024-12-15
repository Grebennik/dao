import { DaoMetadata } from "@aragon/sdk-client";

export function createDaoMetadata(name: string, description: string): DaoMetadata {
  validateMetadata(name, description);
  
  return {
    name,
    description,
    links: [],
    avatar: undefined
  };
}

function validateMetadata(name: string, description: string) {
  console.log(name, description);
  if (!name) {
    throw new Error("DAO name cannot be empty");
  }
  if (!description) {
    throw new Error("DAO description cannot be empty");
  }
}