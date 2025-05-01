import express from "express";
import {
  getPumpTokenPrice,
  getMoonshotTokenPrice,
  getRayAmmPrice,
  getRayClmmPrice,
  getRayCpmmPrice,
  getMeteoraAmmTokenPrice,
  getMeteoraDlmmTokenPrice,
} from "../dex";
import { authenticateKey } from "../middleware/auth";
import { getTokenSupply } from "../service";
export const router = express.Router();

router.use(authenticateKey);

router.get("/price", async (req, res) => {
  const now_t = Date.now();
  try {
    const ca = req.query.ca as string;
    if (ca) {
      const result = await getTokenInfo(ca);
      console.log("\n-[GET] Request:", result, Date.now() - now_t + "ms");
      res.status(200).json(result);
    } else {
      const tokensParam = req.query.tokens as string;
      const tokenAddresses = tokensParam.split(",").map((addr) => addr.trim());
      const results = await Promise.all(
        tokenAddresses.map(async (ca) => {
          try {
            const result = await getTokenInfo(ca);
            return {
              ...result,
              success: true,
            };
          } catch (error) {
            // Return error for this specific token but continue processing others
            return {
              ca,
              success: false,
              error: "Failed to fetch token information",
            };
          }
        })
      );

      console.log(
        `\n-[GET] Batch Request: ${tokenAddresses.length} tokens, ${
          Date.now() - now_t
        }ms`
      );
      res.status(200).json(results);
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Internal Server Error",
      });
  }
});

export async function getTokenInfo(ca: string) {
  const promise_1 = Promise.any([
    getPumpTokenPrice(ca),
    getRayAmmPrice(ca),
    getRayClmmPrice(ca),
    getRayCpmmPrice(ca),
    getMoonshotTokenPrice(ca),
    getMeteoraAmmTokenPrice(ca),
    getMeteoraDlmmTokenPrice(ca),
  ]);
  const promise_2 = getTokenSupply(ca);
  const [tokenPrice, tokenSupply] = await Promise.all([promise_1, promise_2]);
  const token_info = {
    ca,
    ...tokenPrice,
    marketCap: tokenPrice.priceInUsd * tokenSupply,
  };
  return token_info;
}
