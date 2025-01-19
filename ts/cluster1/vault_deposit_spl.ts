import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
} from '@solana/web3.js';
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from '@coral-xyz/anchor';
import { WbaVault, IDL } from './programs/wba_vault';
import wallet from '../keypair.json';
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = 'finalized';

// Create a devnet connection
const connection = new Connection('https://api.devnet.solana.com');

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  'D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o' as Address,
  provider
);

// Create a random keypair
const vaultState = new PublicKey(
  '41oQe5XveWZx6LxopvxNGKxu8xEDY6JqoDeN69jppr8T'
); //the vault state you created

// Create the PDA for our enrollment account
const vaultAuth = PublicKey.findProgramAddressSync(
  [Buffer.from('auth'), vaultState.toBuffer()],
  program.programId
)[0];

// Create the vault key
const vault = PublicKey.findProgramAddressSync(
  [Buffer.from('vault'), vaultAuth.toBuffer()],
  program.programId
);

const token_decimals = 6;

// Mint address
const mint = new PublicKey('FRQSzCo85iszRUPB1uVX7KZ7A4GxSs6g63s1fz4xVedP'); //the spl token you created

// Execute our enrollment transaction
(async () => {
  try {
    //Get the token account of the fromWallet address, and if it does not exist, create it
    const ownerAta = await getOrCreateAssociatedTokenAccount(
      connection, //connection
      keypair, //wallet keypair that is signing the transaction
      mint, //the mint address of the token
      keypair.publicKey //the owner of the token account
    );
    console.log(`Owner ata is: ${ownerAta.address.toBase58()}`);

    //Get the token account of the toWallet address, and if it does not exist, create it
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth,
      true
    );
    console.log(`Vault ata is: ${vaultAta.address.toBase58()}`); // <------- ERROR This dosent console log and ERR: TokenOwnerOffCurveError

    const signature = await program.methods
      .depositSpl(new BN(1_000_000))
      .accounts({
        owner: keypair.publicKey,
        ownerAta: ownerAta.address,
        vaultState,
        vaultAuth,
        tokenMint: mint,
        vaultAta: vaultAta.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([keypair])
      .rpc();
    console.log(
      `Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();

//https://explorer.solana.com/tx/2dJTZoZnhaeUcxo2J4sy1vCLCUkCuSX3ATFo6zcz7BQm3U1TWR7WvC7zMF87xA38Po7igRpWKwPDCN6JaWZ2ANgE?cluster=devnet

/*
Owner ata is: G2amz6sqaihHh8MGKvQrRraFhmLXnPTXdGot2TmDnVS8
Vault ata is: CHgpmRHYLRfqyoYLSFrWXBm76dAGEaRqpkj8zogbdnUg
*/
