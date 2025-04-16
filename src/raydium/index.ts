import { NATIVE_MINT } from "@solana/spl-token";
import { fetchPoolInfoByMint } from "./fetchAmmInfo";
import { calculateReserves } from "./calculateReserves";

const WSOL = NATIVE_MINT.toBase58();
export const getRayTokenPriceInSol = async (ca: string) => {
//   const now_t = Date.now();
  const poolInfo = await fetchPoolInfoByMint(ca, WSOL);
//   console.log("fetchPoolInfoByMint", Date.now() - now_t);
  if (!poolInfo) {
    throw new Error("Raydium pool info not found");
    // return null;
  }
  const { baseMint, baseVault, baseDecimals, quoteMint, quoteVault, quoteDecimals } = poolInfo;
  const poolReserves = await calculateReserves(baseVault, quoteVault);
//   console.log("calculateReserves", Date.now() - now_t);
  // calc liquidity amount
  let wsol_amount = 0, token_amount = 0;
  const base_reserve = poolReserves.baseReserve.toNumber() / 10 ** baseDecimals;
//   const base_reserve = poolReserves.baseReserve.div(new BN(10).pow(new BN(baseDecimals))).toNumber();
  const quote_reserve = poolReserves.quoteReserve.toNumber() / 10 ** quoteDecimals;
//   const quote_reserve = poolReserves.quoteReserve.div(new BN(10).pow(new BN(quoteDecimals))).toNumber();
  wsol_amount = baseMint.equals(NATIVE_MINT) ? base_reserve : quote_reserve;
  token_amount = baseMint.equals(NATIVE_MINT) ? quote_reserve : base_reserve;
  const priceInSol = wsol_amount / token_amount;
  return priceInSol;
};