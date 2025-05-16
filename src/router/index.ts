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
import { DEX_TYPE } from "../service/type";
export const router = express.Router();

router.use(authenticateKey);

// Helper function to handle token requests
async function handleTokenRequest(req: any, res: any, dex?: DEX_TYPE) {
  const now_t = Date.now();
  try {
    const ca = req.query.ca as string;
    if (ca) {
      const result = await getTokenInfo(ca, dex);
      console.log(`\n-[GET] Request (${dex || 'all'}):`, result, Date.now() - now_t + "ms");
      res.status(200).json(result);
    } else {
      const tokensParam = req.query.tokens as string;
      const tokenAddresses = tokensParam.split(",").map((addr) => addr.trim());
      const results = await Promise.all(
        tokenAddresses.map(async (ca) => {
          try {
            const result = await getTokenInfo(ca, dex);
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
        `\n-[GET] Batch Request (${dex || 'all'}): ${tokenAddresses.length} tokens, ${
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
}

// Original endpoint that queries all DEXs
router.get("/price", async (req, res) => {
  await handleTokenRequest(req, res);
});

// New DEX-specific endpoints
router.get("/pumpfun", async (req, res) => {
  await handleTokenRequest(req, res, "pumpfun");
});

router.get("/raydium", async (req, res) => {
  await handleTokenRequest(req, res, "raydium");
});

router.get("/meteora", async (req, res) => {
  await handleTokenRequest(req, res, "meteora");
});

router.get("/moonshot", async (req, res) => {
  await handleTokenRequest(req, res, "moonshot");
});

export async function getTokenInfo(ca: string, dex?: DEX_TYPE) {
  const promise_array = [];
  if (dex === "pumpfun") {
    promise_array.push(getPumpTokenPrice(ca));
  } else if (dex === "raydium") {
    promise_array.push(getRayAmmPrice(ca));
    promise_array.push(getRayClmmPrice(ca));
    promise_array.push(getRayCpmmPrice(ca));
  } else if (dex === "moonshot") {
    promise_array.push(getMoonshotTokenPrice(ca));
  } else if (dex === "meteora") {
    promise_array.push(getMeteoraAmmTokenPrice(ca));
    promise_array.push(getMeteoraDlmmTokenPrice(ca));
  } else {
    promise_array.push(getPumpTokenPrice(ca));
    promise_array.push(getRayAmmPrice(ca));
    promise_array.push(getRayClmmPrice(ca));
    promise_array.push(getRayCpmmPrice(ca));
    promise_array.push(getMoonshotTokenPrice(ca));
    promise_array.push(getMeteoraAmmTokenPrice(ca));
    promise_array.push(getMeteoraDlmmTokenPrice(ca));
  }

  const promise_1 = Promise.any(promise_array);
  const promise_2 = getTokenSupply(ca);
  const [tokenPrice, tokenSupply] = await Promise.all([promise_1, promise_2]);
  const token_info = {
    ca,
    ...tokenPrice,
    marketCap: tokenPrice.priceInUsd * tokenSupply,
  };
  return token_info;
}
