import {
  AMM_V4,
  WSOLMint,
  liquidityStateV4Layout,
} from "@raydium-io/raydium-sdk-v2";
import { CLEAR_CACHE_INTERVAL, connection } from "../config";
import BIGN, { BN } from "bn.js";
import { PublicKey } from "@solana/web3.js";

type PoolInfo = {
  baseMint: PublicKey;
  quoteMint: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
};

const cachePoolInfo = new Map<string, PoolInfo>();
setInterval(() => {
  cachePoolInfo.clear();
}, CLEAR_CACHE_INTERVAL);

const POOL_PROGRAM_ID = AMM_V4;
const POOL_LAYOUT = liquidityStateV4Layout;
const quoteCA = WSOLMint.toBase58();

// Function to fetch pool info using a mint address
export async function getRayAmmPriceInSol(ca: string) {
  try {
    let poolInfo = cachePoolInfo.get(ca);
    if (poolInfo === undefined) {
      poolInfo = await getRayAmmPool(ca);
      cachePoolInfo.set(ca, poolInfo);
    }
    const [baseData, quoteData] = await Promise.all([
      connection.getTokenAccountBalance(poolInfo.baseVault),
      connection.getTokenAccountBalance(poolInfo.quoteVault),
    ]);
    const price =
      new BN(quoteData.value.amount)
        .mul(
            new BN(10).pow(
            new BN(baseData.value.decimals).sub(new BN(quoteData.value.decimals)).add(new BN(9))
            )
        )
        .div(new BN(baseData.value.amount))
        .toNumber() /
      10 ** 9;

    const isBaseToken = ca === poolInfo.baseMint.toBase58();
    const priceInSol = isBaseToken ? price : 1 / price;
    // console.log("Raydium Amm", Date.now());

    return { priceInSol, dex: "Raydium Amm" };
  } catch (error) {
    console.error("Error fetching ray amm pool info:", error);
    throw error;
    // return null;
  }
}

const getFilteredAccounts = async (baseToken: string, quoteToken: string) => {
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

const getRayAmmPool = async (ca: string) => {
  const accounts = await Promise.any([
    getFilteredAccounts(ca, quoteCA),
    getFilteredAccounts(quoteCA, ca),
  ]);

  // Use the first account found where mint is baseMint
  const poolAccount = accounts[0];
  const poolState = POOL_LAYOUT.decode(poolAccount.account.data);
  const poolInfo: PoolInfo = {
    baseMint: poolState.baseMint,
    quoteMint: poolState.quoteMint,
    baseVault: poolState.baseVault,
    quoteVault: poolState.quoteVault,
  };
  return poolInfo;
};
