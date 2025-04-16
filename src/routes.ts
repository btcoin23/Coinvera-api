import express from 'express';
import { getPumpTokenPriceInSol } from './pumpfun';
import { getCachedSolPrice } from './service';
import { getRayTokenPriceInSol } from './raydium';
import { getMoonshotTokenPriceInSol } from './moonshot';
import { getMeteoraAmmTokenPriceInSol } from './meteora/amm';
import { getMeteoraDlmmTokenPriceInSOL } from './meteora/dlmm';
export const router = express.Router();
// import authenticateKey from './middleware/auth';
// import createRateLimiter from './middleware/rateLimiter';

// router.use(authenticateKey);

// router.use((req, res, next) => {
// //   const rateLimiter = createRateLimiter(req.user);
// //   rateLimiter(req, res, next);
// });

router.get('/price', async (req, res) => {
  const ca = req.query.ca as string;
  const now_t = Date.now();
  const priceInSOL = await Promise.any([
    getPumpTokenPriceInSol(ca),
    getRayTokenPriceInSol(ca),
    getMoonshotTokenPriceInSol(ca),
    getMeteoraAmmTokenPriceInSol(ca),
    getMeteoraDlmmTokenPriceInSOL(ca),
  ])
  const priceInUSD = priceInSOL * getCachedSolPrice();
  res.status(200).json({ priceInSOL, priceInUSD });
  console.log("- Request:", ca, priceInSOL, priceInUSD, (Date.now() - now_t) + "ms");
});

// module.exports = router;
