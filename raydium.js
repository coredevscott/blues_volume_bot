import { Transaction, VersionedTransaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Keypair, Connection } from '@solana/web3.js';
import { parseTokenAccountResp } from '@raydium-io/raydium-sdk-v2';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';
import axios from 'axios';
import { NATIVE_MINT } from '@solana/spl-token';
import { API_URLS } from '@raydium-io/raydium-sdk-v2';
import config from "./config.js";
// Replace with your actual secret key
const wallet = Keypair.fromSecretKey(config.PRIVATE_KEY);
const connection = new Connection(config.HTTP_URL);

async function fetchTokenAccountData() {
  try {
    const solAccountResp = await connection.getAccountInfo(wallet.publicKey);
    const tokenAccountResp = await connection.getTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID });
    const token2022Req = await connection.getTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_2022_PROGRAM_ID });

    const tokenAccountData = parseTokenAccountResp({
      owner: wallet.publicKey,
      solAccountResp,
      tokenAccountResp: {
        context: tokenAccountResp.context,
        value: [...tokenAccountResp.value, ...token2022Req.value],
      },
    });

    return tokenAccountData;
  } catch (error) {
    console.error("Error fetching token account data:", error);
    throw error; // Rethrow the error for further handling if needed
  }
};

async function apiSwap(action){
  const inputMint = action === "buy" ? NATIVE_MINT.toBase58() : config.TOKEN_MIN ;
  const outputMint = action === "buy" ?  config.TOKEN_MIN : NATIVE_MINT.toBase58();
  const slippageBps = config.SLIPPAGE;
  const amount = action === "buy" ? config.BUY_AMOUNT : config.SELL_AMOUNT;

  const txVersion = 'V0' // or LEGACY
  const isV0Tx = txVersion === 'V0'

  const [isInputSol, isOutputSol] = [inputMint === NATIVE_MINT.toBase58(), outputMint === NATIVE_MINT.toBase58()]
  
  const { tokenAccounts } = await fetchTokenAccountData()
  const inputTokenAcc = tokenAccounts.find((a) => a.mint.toBase58() === inputMint)?.publicKey
  const outputTokenAcc = tokenAccounts.find((a) => a.mint.toBase58() === outputMint)?.publicKey
  if (!inputTokenAcc && !isInputSol) {
    console.error('do not have input token account')
    return
  }

  // get statistical transaction fee from api
  /**
   * vh: very high
   * h: high
   * m: medium
   */
  const { data } = await axios.get(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`)


  console.log(data);

  const { data: swapResponse } = await axios.get(
    `${
      API_URLS.SWAP_HOST
    }/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
      slippageBps
    }&txVersion=${txVersion}`
  )
  const { data: swapTransactions } = await axios.post(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
    computeUnitPriceMicroLamports: String(data.data.default.m),
    swapResponse,
    txVersion,
    wallet: wallet.publicKey,
    wrapSol: isInputSol,
    unwrapSol: isOutputSol, // true means output mint receive sol, false means output mint received wsol
    inputAccount: isInputSol ? undefined : inputTokenAcc?.toBase58(),
    outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58(),
  })

  const allTxBuf = swapTransactions.data.map((tx) => Buffer.from(tx.transaction, 'base64'))
  const allTransactions = allTxBuf.map((txBuf) =>
    isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)
  )

  console.log(`total ${allTransactions.length} transactions`, swapTransactions)

  let idx = 0
  if (!isV0Tx) {
    for (const tx of allTransactions) {
      console.log(`${++idx} transaction sending...`)
      const transaction = tx
      transaction.sign(wallet)
      const txId = await sendAndConfirmTransaction(connection, transaction, [wallet], { skipPreflight: true })
      console.log(`${++idx} transaction confirmed, txId: ${txId}`)
    }
  } else {
    for (const tx of allTransactions) {
      idx++
      const transaction = tx
      transaction.sign([wallet])
      const txId = await connection.sendTransaction(tx, { skipPreflight: true })
      // const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash({
      //   commitment: 'finalized',
      // })
      console.log(`${idx} transaction send..., txId: ${txId}`)
      // await connection.confirmTransaction(
      //   {
      //     blockhash,
      //     lastValidBlockHeight,
      //     signature: txId,
      //   },
      //   'confirmed'
      // )
      // console.log(`${idx} transaction confirmed`)
    }
  }
}
// apiSwap('buy');
async function startBot() {
  console.log('Starting the volume bot...');
  setInterval(async () => {
      const action = Math.random() > 0.5 ? 'buy' : 'sell';
      console.log(`Performing ${action} trade...`);
      await apiSwap(action);
  }, 20000); // Perform a trade every 5 seconds (adjust as needed)
}

// Start the trading bot
startBot();