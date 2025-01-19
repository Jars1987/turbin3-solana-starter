import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import wallet from '../keypair.json';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = 'confirmed';
const connection = new Connection('https://api.devnet.solana.com', commitment);

// Mint address
const mint = new PublicKey('FRQSzCo85iszRUPB1uVX7KZ7A4GxSs6g63s1fz4xVedP');

// Recipient address
const to = new PublicKey('7FYu8ivFMcC2KDERfxwgmqqH3Zv5MtZeTnWgQVFE8oBe');

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    // Get the token account of the toWallet address, and if it does not exist, create it
    const toAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );
    // Transfer the new token to the "toTokenAccount" we just created

    const transferSig = await transfer(
      connection,
      keypair,
      fromAccount.address,
      toAccount.address,
      keypair.publicKey,
      Number(1_000_000n)
    );

    console.log(`Your transfer txid: ${transferSig}`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
