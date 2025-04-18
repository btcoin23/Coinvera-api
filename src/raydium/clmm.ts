import {
    CLMM_PROGRAM_ID,
    PoolInfoLayout,
    SqrtPriceMath,
    WSOLMint,
  } from "@raydium-io/raydium-sdk-v2";
  import { connection } from "../config";
  
  // Function to fetch pool info using a mint address
  export async function getRayClmmPriceInSol(ca: string) {
    try {
      const POOL_PROGRAM_ID = CLMM_PROGRAM_ID;
      const POOL_LAYOUT = PoolInfoLayout;
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
              offset: POOL_LAYOUT.offsetOf("mintA"),
              bytes: baseToken,
            },
          },
          {
            memcmp: {
              offset: POOL_LAYOUT.offsetOf("mintB"),
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

      const price = SqrtPriceMath.sqrtPriceX64ToPrice(
        poolState.sqrtPriceX64,
        poolState.mintDecimalsA,
        poolState.mintDecimalsB  
      ).toNumber()
      const priceInSol = poolState.mintA.toBase58() === ca? price: 1 / price;
      return priceInSol;
    } catch (error) {
      console.error("Error fetching ray clmm pool info:", error);
      throw error;
    }
  }
  