# Coinvera-API

## Video
[recording-2025-04-18-14-26-40.webm](https://github.com/user-attachments/assets/3ffefff1-8199-49dc-b120-160dc97a4020)
[recording-2025-05-01-02-49-26.webm](https://github.com/user-attachments/assets/b62fcbfa-da02-4256-8b26-2a5910617dc8)

## Features

- Api price of tokens from pumpfun, raydium(amm, clmm, cpmm), moonshot, meteora(amm, dlmm)
- Api-key, usage, rate-limit check
- Websocket subscription

## How to run
- Clone this repo 
    ``` bash
    git clone https://github.com/btcoin23/Coinvera-api.git
    ```
- Run `npm install` or `npx yarn`
- Create `.env` file and set `RPC_URL`, `HTTP_PORT`, `WSS_PORT` and `MONGODB_URI`
    ``` bash
    RPC_URL=https://mainnet.helius-rpc.com/?api-key=...
    MONGODB_URI=mongodb://localhost:27017/SPL-price-api
    HTTP_PORT=5000
    WSS_PORT=8080
    ```
- Check `src/config.ts` for more config
    ``` bash
    export const PlanLimit = {
        free: {
            windowMs: 60 * 1000,
            max: 10,
            batch: 1,
            wssBatch: 1,
        },
        pro: {
            windowMs: 60 * 1000,
            max: 20,
            batch: 10,
            wssBatch: 5,
        },
        advanced: {
            windowMs: 60 * 1000,
            max: 30,
            batch: 20,
            wssBatch: 10,
        }
    }

    export const CLEAR_CACHE_INTERVAL = 1000 * 60 * 60 * 1; // 1 hr
    export const HTTP_PORT = process.env.HTTP_PORT || 3000;
    export const WSS_PORT = process.env.WSS_PORT || 8080;
    export const RPC_URL =
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
    export const connection = new Connection(RPC_URL);

    export const MONGODB_URI = process.env.MONGODB_URI || "http://localhost:27017/SPL-price-api";
    ```
- Run `npm run build`
- Run `npm start`

## Test
- Batch Price API
    ``` bash
    npx ts-node ./test/wss.test.ts
    ```
- Websocket
    ``` bash
    npx ts-node ./test/api.test.ts
    ```

## Response example
- Batch Price API
    ``` bash
    [
        {
            ca: '3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb',
            dex: 'Raydium Amm',
            poolId: 'E7ztWUaAMYFHdbeFrsCFfdhcQJ8zatc27yGWwg9T6bxZ',
            liquidity: 23203.279196515403,
            priceInSol: 0.00000218557,
            priceInUsd: 0.00032465411327697494,
            marketCap: 324507.88011731557,
            success: true
        }
    ]
    ```
- Websocket
    ``` bash
    Received: {
        type: 'subscribePrice',
        status: 'success',
        tokens: [ 'BKdY9X6u9hucgaXbuZ8vVgLvRhPVjT27jrxix7J4pump', '3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb' ]
    }
    Received: {
        ca: '3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb',
        poolId: 'E7ztWUaAMYFHdbeFrsCFfdhcQJ8zatc27yGWwg9T6bxZ',
        liquidity: 23200.745874058674,
        priceInSol: 0.00000218557,
        priceInUsd: 0.000324618667702715,
        marketCap: 324472.4505087191
    },

    Received: {
        type: 'unsubscribePrice',
        status: 'success',
        tokens: [ '3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb' ]
    }
    ```

## Auther
- [Github](https://github.com/btcoin23)
- [Telegram](https://t.me/Btc0in23)
