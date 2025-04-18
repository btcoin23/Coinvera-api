import {
    AMM_V4,
    WSOLMint,
    liquidityStateV4Layout,
  } from "@raydium-io/raydium-sdk-v2";
  import { connection } from "../config";
  import { BN } from "bn.js";
  
  // Function to fetch pool info using a mint address
  export async function getRayAmmPriceInSol(ca: string) {
    try {
      const POOL_PROGRAM_ID = AMM_V4;
      const POOL_LAYOUT = liquidityStateV4Layout;
      const quoteCA = WSOLMint.toBase58();
  
      // Fetch program accounts for Raydium's AMM program (AmmV4)
      const getFilteredAccounts = async (
        baseToken: string,
        quoteToken: string
      ) => {
        const filters = [
          { dataSize: POOL_LAYOUT.span }, // Ensure the correct data size for liquidity pool state
          {
            memcmp: {
              // Memory comparison to match base mint
              offset: POOL_LAYOUT.offsetOf("baseMint"),
              bytes: baseToken,
            },
          },
          {
            memcmp: {
              offset: POOL_LAYOUT.offsetOf("quoteMint"),
              bytes: quoteToken,
            },
          },
        ];
  
        // Fetch program accounts for Raydium's AMM program (AmmV4)
        const accounts = await connection.getProgramAccounts(
          POOL_PROGRAM_ID, // Raydium AMM V4 Program ID
          {
            filters,
          }
        );
  
        if (accounts.length === 0) {
          throw new Error(
            `No pool found for baseToken: ${baseToken} and quoteToken: ${quoteToken}`
          );
        }
        return accounts;
      };
  
      const accounts = await Promise.any([
        getFilteredAccounts(ca, quoteCA),
        getFilteredAccounts(quoteCA, ca),
      ]);
  
      // Use the first account found where mint is baseMint
      const poolAccount = accounts[0];
      const poolState = POOL_LAYOUT.decode(poolAccount.account.data);
      const [baseData, quoteData] = await Promise.all([
        connection.getTokenAccountBalance(poolState.baseVault),
        connection.getTokenAccountBalance(poolState.quoteVault),
      ]);
    //   const baseReserve =
    //     new BN(baseData.value.amount).toNumber() / 10 ** poolState.baseDecimal.toNumber();
    //   const quoteReserve =
    //     new BN(quoteData.value.amount).toNumber() / 10 ** poolState.quoteDecimal.toNumber();
      const price = new BN(quoteData.value.amount).div(new BN(baseData.value.amount)).mul(new BN(10).pow(poolState.baseDecimal.sub(poolState.quoteDecimal).add(new BN(9)))).toNumber() / 10 ** 9;
  
      const isBaseToken = ca === poolState.baseMint.toBase58();
      const priceInSol = isBaseToken
        ? price
        : 1 / price;
      return { priceInSol, dex: "Raydium Amm" };
    } catch (error) {
      console.error("Error fetching ray amm pool info:", error);
      throw error;
    }
  }
  