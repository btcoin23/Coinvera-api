import { BN } from "bn.js";

const WSOL = "So11111111111111111111111111111111111111112";
let cachedSolPrice = 130;

async function fetchLatestSolPrice() {
  const tmpSolPrice = await getSolPrice();
  cachedSolPrice = tmpSolPrice === 0 ? cachedSolPrice : tmpSolPrice;
  await sleep(1000);
  fetchLatestSolPrice();
}

fetchLatestSolPrice();

async function getSolPrice() {
  const url = `https://lite-api.jup.ag/price/v2?ids=${WSOL}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const price = data.data[WSOL]?.price;
    return price;
  } catch (error) {
    console.error("Error fetching SOL price: " + error);
    return 0;
  }
}

export const getCachedSolPrice = () => {
  return cachedSolPrice || 130;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function calculatePrice(
  numeratorAmount: string,
  denominatorAmount: string,
  decimalDifference: number
): number {
  // Add 9 decimals of precision for SOL conversion
  const decimalAdjustment = decimalDifference + 11;

  // Calculate price: (numerator * 10^adjustment) / denominator / 10^9
  const scaledNumerator = new BN(numeratorAmount).mul(
    new BN(10).pow(new BN(decimalAdjustment))
  );
  const rawPrice = scaledNumerator.div(new BN(denominatorAmount));

  // Convert to JavaScript number and adjust for 9 decimals
  return rawPrice.toNumber() / 1e11;
}
