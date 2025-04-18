import * as spl from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { PUMP_FUN_PROGRAM, PUMP_TOKEN_DECIMALS } from "./constants";
import { readBigUintLE } from "./utils";
import { connection } from "../config";

export async function getPumpTokenPriceInSol(ca: string) {
    try{
        const mint = new PublicKey(ca);
        const mint_account = mint.toBuffer();
        const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-curve"), mint_account],
        PUMP_FUN_PROGRAM
        );
        const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
        [bondingCurve.toBuffer(), spl.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        spl.ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const PUMP_CURVE_STATE_OFFSETS = {
        VIRTUAL_TOKEN_RESERVES: 0x08,
        VIRTUAL_SOL_RESERVES: 0x10,
        REAL_TOKEN_RESERVES: 0x18,
        REAL_SOL_RESERVES: 0x20,
        TOTAL_SUPPLY: 0x28,
        };
        const response = await connection.getAccountInfo(bondingCurve);
        if (response === null) {
        // await sleepTime(1000);
        // return await getPumpData(mint);
        throw new Error("curve account not found");
        //   return null;
        }
        // Use BigInt to read the big numbers in the data buffer
        const virtualTokenReserves = readBigUintLE(
        response.data,
        PUMP_CURVE_STATE_OFFSETS.VIRTUAL_TOKEN_RESERVES,
        8
        );
        const virtualSolReserves = readBigUintLE(
        response.data,
        PUMP_CURVE_STATE_OFFSETS.VIRTUAL_SOL_RESERVES,
        8
        );
        const realTokenReserves = readBigUintLE(
        response.data,
        PUMP_CURVE_STATE_OFFSETS.REAL_TOKEN_RESERVES,
        8
        );
        const realSolReserves = readBigUintLE(
        response.data,
        PUMP_CURVE_STATE_OFFSETS.REAL_SOL_RESERVES,
        8
        );
        const totalSupply = readBigUintLE(
        response.data,
        PUMP_CURVE_STATE_OFFSETS.TOTAL_SUPPLY,
        8
        );
    
        const leftTokens = realTokenReserves - 206900000;
        const initialRealTokenReserves = totalSupply - 206900000;
        const progress = 100 - (leftTokens * 100) / initialRealTokenReserves;
        const priceInSol =
        virtualSolReserves /
        LAMPORTS_PER_SOL /
        (virtualTokenReserves / 10 ** PUMP_TOKEN_DECIMALS);
    
        if(virtualSolReserves === 0 || virtualTokenReserves === 0) {
            throw new Error("curve account not found");
        //   return null;
        }
        console.log("Pumpfun", Date.now());

        return { priceInSol, dex: "PumpFun" };
    }catch(error){
        console.error(error);
        throw error;
        // return null;
    }
  }