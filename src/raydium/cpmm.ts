import {
  CREATE_CPMM_POOL_PROGRAM,
  CpmmPoolInfoLayout,
  WSOLMint,
} from "@raydium-io/raydium-sdk-v2";
import { CLEAR_CACHE_INTERVAL, connection } from "../config";
import { BN } from "bn.js";
import { PublicKey } from "@solana/web3.js";

type PoolInfo = {
  mintA: PublicKey;
  mintB: PublicKey;
  vaultA: PublicKey;
  vaultB: PublicKey;
};

const cachePoolInfo = new Map<string, PoolInfo>();
setInterval(() => {
  cachePoolInfo.clear();
}, CLEAR_CACHE_INTERVAL);

const POOL_PROGRAM_ID = CREATE_CPMM_POOL_PROGRAM;
const POOL_LAYOUT = CpmmPoolInfoLayout;
const quoteCA = WSOLMint.toBase58();

// Function to fetch pool info using a mint address
export async function getRayCpmmPriceInSol(ca: string) {
  try {
    // Fetch program accounts for Raydium's AMM program (AmmV4)

    let poolInfo = cachePoolInfo.get(ca);
    if (poolInfo === undefined) {
      poolInfo = await getRayCpmmPool(ca);
      cachePoolInfo.set(ca, poolInfo);
    }
    const [baseData, quoteData] = await Promise.all([
      connection.getTokenAccountBalance(poolInfo.vaultA),
      connection.getTokenAccountBalance(poolInfo.vaultB),
    ]);
    // const baseReserve =
    //   new BN(baseData.value.amount).div(new BN(10).pow(new BN(poolState.mintDecimalA))).toNumber();
    // const quoteReserve =
    //   new BN(quoteData.value.amount).div(new BN(10).pow(new BN(poolState.mintDecimalB))).toNumber();

    const price =
      new BN(quoteData.value.amount)
        .mul(
            new BN(10).pow(
            new BN(baseData.value.decimals)
                .sub(new BN(quoteData.value.decimals))
                .add(new BN(9))
            )
        )
        .div(new BN(baseData.value.amount))
        .toNumber() /
      10 ** 9;

    const isBaseToken = ca === poolInfo.mintA.toBase58();
    const priceInSol = isBaseToken ? price : 1 / price;
    // console.log("Raydium Cpmm", Date.now());

    return { priceInSol, dex: "Raydium Cpmm" };
  } catch (error) {
    console.error("Error fetching ray cpmm pool info:", error);
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

const getRayCpmmPool = async (ca: string) => {
  const accounts = await Promise.any([
    getFilteredAccounts(ca, quoteCA),
    getFilteredAccounts(quoteCA, ca),
  ]);

  // Use the first account found where mint is baseMint
  const poolAccount = accounts[0];
  const poolState = POOL_LAYOUT.decode(poolAccount.account.data);

  const poolInfo: PoolInfo = {
    mintA: poolState.mintA,
    mintB: poolState.mintB,
    vaultA: poolState.vaultA,
    vaultB: poolState.vaultB,
  };
  return poolInfo;
};
