import { PublicKey } from "@solana/web3.js";
import * as spl from "@solana/spl-token";
import DLMM, { IDL, LBCLMM_PROGRAM_IDS } from "@meteora-ag/dlmm";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { CLEAR_CACHE_INTERVAL, connection } from "../../config";
import { getCachedSolPrice } from "../../service";
import { BN } from "bn.js";

const cachePoolInfo = new Map<string, PublicKey>();
setInterval(() => {
    cachePoolInfo.clear();
}, CLEAR_CACHE_INTERVAL);

export const getMeteoraDlmmTokenPrice = async (ca: string) => {
  try {
    const mint = new PublicKey(ca);

    //  Get pool ID
    let poolAccount = cachePoolInfo.get(ca);
    if (poolAccount === undefined) {
      poolAccount = await getMeteoraDlmmPool(mint);
      cachePoolInfo.set(ca, poolAccount);
    }

    // Create DLMM object
    const dlmmPool = await DLMM.create(connection, poolAccount);
    const activeBin = await dlmmPool.getActiveBin();
    const isBaseToken = dlmmPool.tokenX.mint.address.equals(mint);
    const wsol_amount = isBaseToken? activeBin.yAmount.toNumber() : activeBin.xAmount.toNumber();
    const liquidity = 2 * wsol_amount / 10 ** 9 * getCachedSolPrice();
    if(liquidity === 0) throw new Error("No liquidity");
    const price = Number(activeBin.pricePerToken);
    const priceInSol = isBaseToken ? price : 1 / price;
    const priceInUsd = priceInSol * getCachedSolPrice();
    // console.log("Meteora Dlmm", Date.now());

    return { dex: "Meteora DLMM", poolId: poolAccount.toBase58(), liquidity, priceInSol, priceInUsd };
  } catch (error) {
    console.error("Error fetching Meteora DLMM token price:", error);
    throw error
    // return null
  }
};

async function getLbPairsForTokens(mint: PublicKey) {
  const provider = new AnchorProvider(
    connection,
    {} as any,
    AnchorProvider.defaultOptions()
  );
  const program = new Program(
    IDL,
    LBCLMM_PROGRAM_IDS["mainnet-beta"],
    provider
  );

  const [poolsForTokenAMint, poolsForTokenBMint] = await Promise.all([
    program.account.lbPair.all([
      {
        memcmp: {
          offset: 88,
          bytes: mint.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 120,
          bytes: spl.NATIVE_MINT.toBase58(),
        },
      },
    ]),
    program.account.lbPair.all([
      {
        memcmp: {
          offset: 88,
          bytes: spl.NATIVE_MINT.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 120,
          bytes: mint.toBase58(),
        },
      },
    ]),
  ]);

  return [...poolsForTokenAMint, ...poolsForTokenBMint];
}

const getMeteoraDlmmPool = async (mint: PublicKey) => {
  const lbPairs = await getLbPairsForTokens(mint);
  if (lbPairs.length === 0) {
    throw new Error("No LB pair found for token");
  }
  const tokenAmounts = await Promise.all(
    lbPairs.map((lbPair) =>
      connection.getTokenAccountBalance(
        lbPair.account.tokenXMint.toBase58() === spl.NATIVE_MINT.toBase58()
          ? lbPair.account.reserveX
          : lbPair.account.reserveY
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
//   console.log("- Meteora DLMM:", lbPairs[maxIndex].publicKey.toBase58());

  return lbPairs[maxIndex].publicKey;
};
