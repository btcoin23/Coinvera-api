import { Moonshot, Environment } from "@wen-moon-ser/moonshot-sdk";
import { RPC_URL } from "../config";

export async function getMoonshotTokenPriceInSol(ca: string) {
  try{
    const moonshot = new Moonshot({
        rpcUrl: RPC_URL,
        authToken: "YOUR_AUTH_TOKEN",
        environment: Environment.MAINNET,
      });
    
      const token = moonshot.Token({
        mintAddress: ca,
      });
      const curvePos = await token.getCurvePosition();
      const collateralPrice = await token.getCollateralPrice({
        tokenAmount: BigInt(1e9), // 1 token in minimal units
        curvePosition: curvePos,
      });
      const priceInSol = Number(collateralPrice) / 1e9; // Convert lamports to SOL
      console.log("Moonshot", Date.now());

      return { priceInSol, dex: "Moonshot" };
  }catch(error){
    console.error(error);
    throw error;
    // return null;
  }
}
