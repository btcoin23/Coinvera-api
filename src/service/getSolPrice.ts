import { NATIVE_MINT } from "@solana/spl-token";
const WSOL = NATIVE_MINT.toBase58();

export default async function getSolPrice(){
    const url = `https://lite-api.jup.ag/price/v2?ids=${WSOL}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const price = data.data[WSOL]?.price;
      return price;
    } catch (error) {
      console.log("Error fetching SOL price: " + error);
      return 0;
    }
  };