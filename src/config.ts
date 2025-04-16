import { Connection } from "@solana/web3.js";
import { configDotenv } from "dotenv";
configDotenv();

export const PORT = process.env.PORT || 3000;

const RPC_URL =
  process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const WSS_URL =
  process.env.WSS_URL || "ws://api.mainnet-beta.solana.com";

export const connection = new Connection(RPC_URL);