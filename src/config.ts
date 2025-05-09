import { Connection } from "@solana/web3.js";
import { configDotenv } from "dotenv";
configDotenv();

export const PlanLimit = {
  free: {
    windowMs: 60 * 1000,
    max: 10,
    batch: 1,
    wssBatch: 1,
  },
  pro: {
    windowMs: 60 * 1000,
    max: 20,
    batch: 10,
    wssBatch: 5,
  },
  advanced: {
    windowMs: 60 * 1000,
    max: 30,
    batch: 20,
    wssBatch: 10,
  }
}

export const CLEAR_CACHE_INTERVAL = 1000 * 60 * 60 * 1; // 1 hr
export const HTTP_PORT = process.env.HTTP_PORT || 3000;
export const WSS_PORT = process.env.WSS_PORT || 8080;
export const RPC_URL =
  process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
export const GRPC_URL =
  process.env.GRPC_URL || "";
export const connection = new Connection(RPC_URL);

export const MONGODB_URI = process.env.MONGODB_URI || "http://localhost:27017/SPL-price-api";