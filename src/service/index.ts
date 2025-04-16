import getSolPrice from "./getSolPrice";

let cachedSolPrice = 130; 

// Function to fetch the latest blockhash and cache it
async function fetchLatestSolPrice() {
  const tmpSolPrice = await getSolPrice();
  cachedSolPrice = tmpSolPrice === 0 ? cachedSolPrice : tmpSolPrice;
  await sleep(1000);
  fetchLatestSolPrice();
//   console.log("cachedSolPrice", cachedSolPrice);
}

fetchLatestSolPrice();
// setInterval(fetchLastValidBlockhash, 1100);

export const getCachedSolPrice = () => {
  return cachedSolPrice || 130;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};