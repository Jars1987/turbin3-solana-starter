import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import wallet from '../../keypair.json';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = 'confirmed';
const connection = new Connection('https://api.devnet.solana.com', commitment);

// Mint address
const mint = new PublicKey('5a3UUtHNrNwvKNVVd8Snr6f8AkmDh4wsVEC6jRLSQGcX');

// Recipient address
const to = new PublicKey('<receiver address>');

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    // Get the token account of the toWallet address, and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );
    // Transfer the new token to the "toTokenAccount" we just created

    const transferSig = await transfer(
      connection,
      keypair,
      fromTokenAccount.address,
      toTokenAccount.address,
      keypair.publicKey,
      Number(1_000_000n)
    );

    console.log(`Your transfer txid: ${transferSig}`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
