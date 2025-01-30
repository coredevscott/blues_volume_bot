export default {
    RAYDIUM_PUBLIC_KEY: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
    HTTP_URL: "https://api.mainnet-beta.solana.com",
    WSS_URL: "wss://api.mainnet-beta.solana.com",
    HTTP_URL_TEST: "https://api.devnet.solana.com",
    WSS_URL_TEST: "wss://api.devnet.solana.com",
    NATIVE_TOKEN: "So11111111111111111111111111111111111111112", // SOL Token
    // PRIVATE_KEY: Uint8Array.from([252,87,127,228,98,169,100,1,239,70,28,253,253,166,208,230,23,93,77,252,249,143,152,228,208,32,129,187,38,158,140,94,76,83,211,68,248,129,49,160,193,209,185,230,184,153,43,44,246,47,241,9,57,62,81,164,155,56,177,165,150,1,18,106]),
    PRIVATE_KEY: Uint8Array.from([19,123,230,178,88,27,89,251,102,64,220,54,27,18,234,37,60,52,66,150,89,232,202,99,116,48,232,62,130,207,44,190,121,224,73,91,111,105,135,5,121,92,208,30,77,83,60,148,234,135,134,196,225,48,208,23,123,128,202,133,9,36,89,244]),
    OBSERVE_ONLY: true, // Set to true to observe logs without buying
    BUY_AMOUNT: 1000000, // Amount in lamports (1 SOL)
    SELL_AMOUNT: 100000000000,
    SLIPPAGE: 50, // Slippage in basis points (e.g., 0.5%)
    STOP_LOSS: 90, // Stop loss percentage (e.g., 90%)
    TAKE_PROFIT: 120, // Take profit percentage (e.g., 120%)
    TOKEN_MIN: "8vUQxYgcJxiPgXFNeybv7Xd64QwFvvUoWvjomtPaP9WA"
};

// import { Keypair, Connection } from "@solana/web3.js";
// import {parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2'
// import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

// const walletKey = Keypair.fromSecretKey(new Uint8Array([19,123,230,178,88,27,89,251,102,64,220,54,27,18,234,37,60,52,66,150,89,232,202,99,116,48,232,62,130,207,44,190,121,224,73,91,111,105,135,5,121,92,208,30,77,83,60,148,234,135,134,196,225,48,208,23,123,128,202,133,9,36,89,244]));
// export const owner = Keypair.fromSecretKey(bs58.decode(walletKey.secretKey))
// export const connection = new Connection('https://api.mainnet-beta.solana.com')
// export const fetchTokenAccountData = async () => {
//     const solAccountResp = await connection.getAccountInfo(owner.publicKey)
//     const tokenAccountResp = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_PROGRAM_ID })
//     const token2022Req = await connection.getTokenAccountsByOwner(owner.publicKey, { programId: TOKEN_2022_PROGRAM_ID })
//     const tokenAccountData = parseTokenAccountResp({
//       owner: owner.publicKey,
//       solAccountResp,
//       tokenAccountResp: {
//         context: tokenAccountResp.context,
//         value: [...tokenAccountResp.value, ...token2022Req.value],
//       },
//     })
//     return tokenAccountData
//   }