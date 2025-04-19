# SOLANA TOKEN PRICE API BACKEND

## Video
[recording-2025-04-18-14-26-40.webm](https://github.com/user-attachments/assets/3ffefff1-8199-49dc-b120-160dc97a4020)

## Features

- Api price of tokens from pumpfun, raydium(amm, clmm, cpmm), moonshot, meteora(amm, dlmm)
- Api-key check
- Api-key usage check
- Rate-limit check

## How to run
- Clone this repo 
    ``` bash
    git clone https://github.com/btcoin23/Spl-api-backend.git
    ```
- Run `npm install`
- Create `.env` file and set `RPC_URL`, `PORT` and `MONGODB_URI`
    ``` bash
    RPC_URL=https://mainnet.helius-rpc.com/?api-key=...
    MONGODB_URI=mongodb://localhost:27017/SPL-price-api
    PORT=5000
    ```
- Check `src/config.ts` for more config
    ``` bash
    export const RateLimit = {
        free: {
            windowMs: 60 * 1000,
            max: 10,
        },
        pro: {
            windowMs: 60 * 1000,
            max: 20,
        },
        advanced: {
            windowMs: 60 * 1000,
            max: 30,
        }
    }

    export const CLEAR_CACHE_INTERVAL = 1000 * 60 * 60 * 1; // 1 hr
    export const PORT = process.env.PORT || 3000;
    export const RPC_URL =
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
    export const connection = new Connection(RPC_URL);

    export const MONGODB_URI = process.env.MONGODB_URI || "http://localhost:27017/SPL-price-api";
    ```
- Run `npm run dev`

## How to use
- Open the Terminal window and type this 
    ``` bash
    curl -X GET "http://localhost:5000/api/v1/price?ca=2aziTNXVUtca823nCUx9AMAci5pB4YWYhkC13pwrpump" \
  -H "x-api-key: 6565f8c42ba4daf900da3cad5d12d124946d7588" \
  -H "Content-Type: application/json"
    ```
- `ca` is the address of the token
- `x-api-key` is the api-key
- `Content-Type` is `application/json`

## Response example
- The response of token `2aziTNXVUtca823nCUx9AMAci5pB4YWYhkC13pwrpump` price
    ``` bash
    {
        "dex": "PumpFun",
        "priceInSol": 2.7958993493010253e-8,
        "priceInUsd": 0.0000037468891867774903
    }
    ```

## Auther
- [Github](https://github.com/btcoin23)
- [Telegram](https://t.me/Btc0in23)
