import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
} from '@solana/web3.js';
import { Program, Wallet, AnchorProvider, Address } from '@coral-xyz/anchor';
import { WbaVault, IDL } from './programs/wba_vault';
import wallet from '../../keypair.json';
/// J8qKEmQpadFeBuXAVseH8GNrvsyBhMT8MHSVD3enRgJz

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = 'confirmed';

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
const vaultState = Keypair.generate();
console.log(`Vault public key: ${vaultState.publicKey.toBase58()}`);

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState

const [vaultAuth, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from('auth'), vaultState.publicKey.toBuffer()],
  program.programId
);

/*
alternative:
const vaultAuth = PublicKey.findProgramAddressSync(
  [Buffer.from('auth'), vaultState.publicKey.toBuffer()],
  program.programId
)[0] // the public key;

*/

// Create the vault key
// Seeds are "vault", vaultAuth
const vault = PublicKey.findProgramAddressSync(
  [Buffer.from('vault'), vaultAuth.toBuffer()],
  program.programId
)[0];

// Execute our enrollment transaction
// 1) check IDL for the Accounts passed in the initialize instruction

//did not pass all the accounts because anchor will automatically pass owner (its the first signer)
//and will pass the vault because it is a derived address from the vaultAuth
//Since we already passed the vaultAuth and the IDL has seeds for vaultAuth, anchor will automatically pass the vault

(async () => {
  try {
    const signature = await program.methods
      .initialize()
      .accounts({
        vaultState: vaultState.publicKey,
        vaultAuth: vaultAuth,
      })
      .signers([keypair, vaultState])
      .rpc();
    console.log(
      `Init success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();

// https://explorer.solana.com/tx/5VymktvSvKZnLkpupmmyaHYfFZkak1gT3HqYaXAwMaSnPuUyzJN6s7Lv3evv7W92opWATWjp1HLsGC5YKMehbLG7?cluster=devnet
