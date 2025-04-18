import { Connection } from "@solana/web3.js";
import { configDotenv } from "dotenv";
configDotenv();

export const RateLimit = {
  free: {
    windowMs: 60 * 1000,
    max: 10,
  },
  pro: {
    windowMs: 60 * 1000,
    max: 20,
  },
  advanced: {
    windowMs: 60 * 1000,
    max: 30,
  }
}

export const CLEAR_CACHE_INTERVAL = 1000 * 60 * 60 * 1; // 1 hr
export const PORT = process.env.PORT || 3000;
export const RPC_URL =
  process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
export const connection = new Connection(RPC_URL);

export const MONGODB_URI = process.env.MONGODB_URI || "http://localhost:27017/SPL-price-api";