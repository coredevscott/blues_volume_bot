import {
    Connection,
    Keypair,
    VersionedTransaction,
  } from "@solana/web3.js";
  import fetch from "node-fetch";
  import config from "./config.js";
  
  const connection = new Connection(config.HTTP_URL, {
    wsEndpoint: config.WSS_URL
  });

  const wallet = Keypair.fromSecretKey(config.PRIVATE_KEY);

  async function getWalletBalance() {
    // Create a connection to the Solana cluster
    const connection = new Connection(config.HTTP_URL);

    // Convert the public key string to a PublicKey object
    const publicKey = wallet.publicKey;

    try {
        // Get the balance in lamports (1 SOL = 1,000,000,000 lamports)
        const balance = await connection.getBalance(publicKey);
        
        // Convert the balance to SOL
        const balanceInSOL = balance / 1e9;

        console.log(`Balance for wallet ${publicKey}: ${balanceInSOL} SOL`);
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
  }

  async function startTrading(token='buy') {
    try 
    {
        const inputMint = token === "buy" ?  config.NATIVE_TOKEN : config.TOKEN_MIN ;
        const outputMint = token === "buy" ?  config.TOKEN_MIN : config.NATIVE_TOKEN;
        const slippageBps = config.SLIPPAGE;
        const amount = token === "buy" ? config.BUY_AMOUNT : config.SELL_AMOUNT;
      
      const quoteResponse = 
        await fetch(
            `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&restrictIntermediateTokens=true`
        ).then((res) => res.json());
  
      if (!quoteResponse?.routePlan?.length) {
        console.log("No swap routes available.");
        return;
      }
      await Buy_Token(quoteResponse);
    } catch (error) {
      console.error("Error during swap execution:", error);
    }
  }
  async function Buy_Token(quoteResponse)
  {
    try {
      getWalletBalance();
      const { swapTransaction } = await fetch("https://api.jup.ag/swap/v1/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: wallet.publicKey.toString(),
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          prioritizationFeeLamports: {
                priorityLevelWithMaxLamports: {
                    maxLamports: 1000000000,
                    priorityLevel: "veryHigh"
                }
            }
        }),
    }).then((res) => res.json());
    
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    transaction.sign([wallet]);
    const transactionBinary = transaction.serialize();

    const signature = await connection.sendRawTransaction(transactionBinary, {
        maxRetries: 2,
        skipPreflight: true
    });

    const confirmation = await connection.confirmTransaction({signature,}, "finalized");
    if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}\nhttps://solscan.io/tx/${signature}/`);
    } else console.log(`Transaction successful: https://solscan.io/tx/${signature}/`);
    } catch (error) {
      console.error("Error executing swap transaction:", error);
    }
  }
  async function startBot() {
    console.log('Starting the volume bot...');
    setInterval(async () => {
        const action = Math.random() > 0.5 ? 'buy' : 'sell';
        console.log(`Performing ${action} trade...`);
        await startTrading(action);
    }, 10000); // Perform a trade every 5 seconds (adjust as needed)
  }
  
  startBot();
  // setTimeout(startBot, 5000);