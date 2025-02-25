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
const vaultState = new PublicKey(
  '41oQe5XveWZx6LxopvxNGKxu8xEDY6JqoDeN69jppr8T'
);
// Create the PDA for our enrollment account
const vaultAuth = PublicKey.findProgramAddressSync(
  [Buffer.from('auth'), vaultState.toBuffer()],
  program.programId
)[0];

// Create the vault key
const vault = PublicKey.findProgramAddressSync(
  [Buffer.from('vault'), vaultAuth.toBuffer()],
  program.programId
)[0];

// Execute our enrollment transaction
(async () => {
  try {
    const signature = await program.methods
      .deposit(new BN(1000000000)) //lamports depoisiting
      .accounts({
        owner: keypair.publicKey,
        vaultState,
        vaultAuth,
        vault,
        systemProgram: SystemProgram.programId,
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

// https://explorer.solana.com/tx/3LpzCm3jSTVeChzRs3s9BEeqQmopas8ooH6UJ3xhkG7gc4qy1UzUDPsU8nqATMCfqaKiSZniHwpPQPEfjHuJdYLq?cluster=devnet
