import AmmImpl, {
  AmmIdl,
  PROGRAM_ID,
} from "@mercurial-finance/dynamic-amm-sdk";
import { PublicKey } from "@solana/web3.js";
import * as spl from "@solana/spl-token";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { CLEAR_CACHE_INTERVAL, connection } from "../config";
import { BN } from "bn.js";

const cachePoolInfo = new Map<string, PublicKey>();
setInterval(() => {
    cachePoolInfo.clear();
}, CLEAR_CACHE_INTERVAL);

export const getMeteoraAmmTokenPriceInSol = async (ca: string) => {
  try {
    const mint = new PublicKey(ca);

    //  Get pool ID
    let poolAccount = cachePoolInfo.get(ca);
    if (poolAccount === undefined) {
      poolAccount = await getMeteoraAmmPool(mint);
      cachePoolInfo.set(ca, poolAccount);
    }

    // Create Amm object
    const stabelPool = await AmmImpl.create(connection, poolAccount);
    if (!stabelPool) throw new Error("Invalid pool");
    const isBaseToken = stabelPool.vaultA.tokenMint.address.equals(mint);
    // const tokenA_amount = stabelPool.poolInfo.tokenAAmount.toNumber() / 10 ** stabelPool.vaultA.tokenMint.decimals;
    // const tokenB_amount = stabelPool.poolInfo.tokenBAmount.toNumber() / 10 ** stabelPool.vaultB.tokenMint.decimals;
    // const token_amount = isBaseToken? tokenA_amount : tokenB_amount;
    // const wsol_amount = isBaseToken? tokenB_amount : tokenA_amount;
    const price =
      stabelPool.poolInfo.tokenBAmount
        .mul(
            new BN(10).pow(
            new BN(stabelPool.vaultA.tokenMint.decimals)
                .sub(new BN(stabelPool.vaultB.tokenMint.decimals))
                .add(new BN(9))
            )
        )
        .div(stabelPool.poolInfo.tokenAAmount)
        .toNumber() /
      10 ** 9;
    const priceInSol = isBaseToken ? price : 1 / price;
    // console.log("Meteora Amm", Date.now);
    return { priceInSol, dex: "Meteora AMM" };
  } catch (error) {
    console.error("Error fetching Meteora AMM token price:", error);
    throw error;
    // return null
  }
};

async function getAmmPool(mint: PublicKey) {
  const provider = new AnchorProvider(
    connection,
    {} as any,
    AnchorProvider.defaultOptions()
  );
  const program = new Program(AmmIdl, PROGRAM_ID, provider);

  const [poolsForTokenAMint, poolsForTokenBMint] = await Promise.all([
    program.account.pool.all([
      {
        memcmp: {
          offset: 40,
          bytes: mint.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 72,
          bytes: spl.NATIVE_MINT.toBase58(),
        },
      },
    ]),
    program.account.pool.all([
      {
        memcmp: {
          offset: 40,
          bytes: spl.NATIVE_MINT.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 72,
          bytes: mint.toBase58(),
        },
      },
    ]),
  ]);

  return [...poolsForTokenAMint, ...poolsForTokenBMint];
}

const getMeteoraAmmPool = async (mint: PublicKey) => {
  const ammPools = await getAmmPool(mint);
  if (ammPools.length === 0) throw new Error("No Meteora AMM pool found");
  const tokenAmounts = await Promise.all(
    ammPools.map((pool) =>
      connection.getTokenAccountBalance(
        pool.account.tokenAMint.toBase58() === spl.NATIVE_MINT.toBase58()
          ? pool.account.aVaultLp
          : pool.account.bVaultLp
      )
    )
  );

  const maxIndex = tokenAmounts.reduce((maxIdx, current, idx, arr) => {
    const currentValue = current.value.uiAmount;
    const maxValue = arr[maxIdx].value.uiAmount;

    if (currentValue === null) return maxIdx;
    if (maxValue === null || currentValue > maxValue) return idx;

    return maxIdx;
  }, 0);
//   console.log("- Meteora AMM:", ammPools[maxIndex].publicKey.toBase58());
  const poolId = ammPools[maxIndex].publicKey;

  return poolId;
};
