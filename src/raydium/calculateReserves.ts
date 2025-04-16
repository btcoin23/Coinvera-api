import { PublicKey } from "@solana/web3.js";
import { connection } from "../config";
import { BN } from "bn.js";


export const calculateReserves = async (baseVault: PublicKey, quoteVault: PublicKey) => {
    try {
  
      // const baseReserve = await getTokenAmount(poolKeys.baseVault, connection);
      // const quoteReserve = await getTokenAmount(poolKeys.quoteVault, connection);
      const [base, quote] = await Promise.all([
        await connection.getTokenAccountBalance(baseVault),
        await connection.getTokenAccountBalance(quoteVault)
      ])
      const baseReserve = new BN(base.value.amount);
      const quoteReserve = new BN(quote.value.amount);
  
      return {
        baseReserve,
        quoteReserve,
      };
    } catch (error) {
      console.error('Failed to calculate reserves:', error);
      throw error;
    }
  }