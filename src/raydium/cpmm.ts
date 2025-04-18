import {
  CREATE_CPMM_POOL_PROGRAM,
  CpmmPoolInfoLayout,
  WSOLMint,
} from "@raydium-io/raydium-sdk-v2";
import { connection } from "../config";
import { BN } from "bn.js";

// Function to fetch pool info using a mint address
export async function getRayCpmmPriceInSol(ca: string) {
  try {
    const POOL_PROGRAM_ID = CREATE_CPMM_POOL_PROGRAM;
    const POOL_LAYOUT = CpmmPoolInfoLayout;
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
    const [baseData, quoteData] = await Promise.all([
      connection.getTokenAccountBalance(poolState.vaultA),
      connection.getTokenAccountBalance(poolState.vaultB),
    ]);
    // const baseReserve =
    //   new BN(baseData.value.amount).div(new BN(10).pow(new BN(poolState.mintDecimalA))).toNumber();
    // const quoteReserve =
    //   new BN(quoteData.value.amount).div(new BN(10).pow(new BN(poolState.mintDecimalB))).toNumber();

    const price = new BN(quoteData.value.amount).div(new BN(baseData.value.amount)).mul(new BN(10).pow(new BN(poolState.mintDecimalA).sub(new BN(poolState.mintDecimalB)).add(new BN(9)))).toNumber() / 10 ** 9;

    const isBaseToken = ca === poolState.mintA.toBase58();
    const priceInSol = isBaseToken
      ? price
      : 1 / price;
    return priceInSol;
  } catch (error) {
    console.error("Error fetching ray cpmm pool info:", error);
    throw error;
  }
}
