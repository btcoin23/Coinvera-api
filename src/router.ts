import express from 'express';
import { getPumpTokenPriceInSol } from './pumpfun';
import { getMoonshotTokenPriceInSol } from './moonshot';
import { getRayAmmPriceInSol, getRayClmmPriceInSol, getRayCpmmPriceInSol } from './raydium';
import { getMeteoraAmmTokenPriceInSol, getMeteoraDlmmTokenPriceInSOL } from './meteora';
import { authenticateKey } from './middleware/auth';
export const router = express.Router();

router.use(authenticateKey);

router.get('/price', async (req, res) => {
  const now_t = Date.now();
  try{
    const ca = req.query.ca as string;
    const result = await Promise.any([
      getPumpTokenPriceInSol(ca),
      getRayAmmPriceInSol(ca),
      getRayClmmPriceInSol(ca),
      getRayCpmmPriceInSol(ca),
      getMoonshotTokenPriceInSol(ca),
      getMeteoraAmmTokenPriceInSol(ca),
      getMeteoraDlmmTokenPriceInSOL(ca),
    ])
    console.log("\n-[GET] Request:", ca, result, (Date.now() - now_t) + "ms");
    res.status(200).json(result);
  }catch(error){
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});