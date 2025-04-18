import { Connection } from "@solana/web3.js";
import { configDotenv } from "dotenv";
configDotenv();

export const CLEAR_CACHE_INTERVAL = 1000 * 60 * 60 * 1; // 1 minutes
export const PORT = process.env.PORT || 3000;
export const RPC_URL =
  process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
export const connection = new Connection(RPC_URL);