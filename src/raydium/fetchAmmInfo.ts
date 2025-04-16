import { connection } from "../config";
import {
  LIQUIDITY_STATE_LAYOUT_V4,
  MAINNET_PROGRAM_ID,
} from "@raydium-io/raydium-sdk";

// Function to fetch pool info using a mint address
export async function fetchPoolInfoByMint(
  baseToken: string,
  quoteToken: string = ""
) {
  try {
    const filters = [
      { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span }, // Ensure the correct data size for liquidity pool state
      {
        memcmp: {
          // Memory comparison to match base mint
          offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
          bytes: baseToken,
        },
      },
    ];

    if (quoteToken !== "") {
      filters.push({
        memcmp: {
          offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
          bytes: quoteToken,
        },
      });
    }

    // Fetch program accounts for Raydium's AMM program (AmmV4)
    const accounts = await connection.getProgramAccounts(
      MAINNET_PROGRAM_ID.AmmV4, // Raydium AMM V4 Program ID
      {
        filters,
      }
    );

    let poolAccount;

    if (accounts.length === 0) {
      const filters = [
        { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span }, // Ensure the correct data size for liquidity pool state
        {
          memcmp: {
            // Memory comparison to match base mint
            offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
            bytes: baseToken,
          },
        },
      ];

      if (quoteToken !== "") {
        filters.push({
          memcmp: {
            offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
            bytes: quoteToken,
          },
        });
      }
      // If no account was found with mint as baseMint, try matching it as quoteMint
      const quoteAccounts = await connection.getProgramAccounts(
        MAINNET_PROGRAM_ID.AmmV4, // Raydium AMM V4 Program ID
        {
          filters,
        }
      );

      if (quoteAccounts.length === 0) {
        throw new Error(`No pool found for mint: ${baseToken}`);
        // console.log(`No pool found for mint: ${baseToken}`);
        // return null;
      }

      // Use the first account found where mint is quoteMint
      poolAccount = quoteAccounts[0];
    }

    // Use the first account found where mint is baseMint
    poolAccount = accounts[0];
    const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(
      poolAccount.account.data
    );

    const baseMint = poolState.baseMint;
    const baseVault = poolState.baseVault;
    const baseDecimals = poolState.baseDecimal.toNumber();

    const quoteMint = poolState.quoteMint;
    const quoteVault = poolState.quoteVault;
    const quoteDecimals = poolState.quoteDecimal.toNumber();
    return {
      baseMint,
      baseVault,
      baseDecimals,
      quoteMint,
      quoteVault,
      quoteDecimals,
    };
  } catch (error) {
    // console.log("Error fetching pool info:", error);
    throw error;
  }
}
