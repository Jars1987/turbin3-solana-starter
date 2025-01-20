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
  ASSOCIATED_TOKEN_PROGRAM_ID,
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
);

// Create the PDA for our enrollment account
const vaultAuth = PublicKey.findProgramAddressSync(
  [Buffer.from('auth'), vaultState.toBuffer()],
  program.programId
);

// Create the vault key
const vault = PublicKey.findProgramAddressSync(
  [Buffer.from('vault'), vaultAuth[0].toBuffer()],
  program.programId
);

// Mint address
const mint = new PublicKey('AE1rrd19g79MnyP1YyfritjuE51mch45WZSJFmDx2kpG');

// Execute our deposit transaction
(async () => {
  try {
    const metadataProgram = new PublicKey(
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
    );
    const metadataAccount = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), metadataProgram.toBuffer(), mint.toBuffer()],
      metadataProgram
    )[0];
    const masterEdition = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        metadataProgram.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
      ],
      metadataProgram
    )[0];

    // b"metadata", MetadataProgramID.key.as_ref(), mint.key.as_ref() "master"
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const ownerAta = await getOrCreateAssociatedTokenAccount(
      connection, //connection
      keypair, //wallet keypair that is signing the transaction
      mint, //the mint address of the token
      keypair.publicKey //the owner of the token account
    );

    // // Get the token account of the fromWallet address, and if it does not exist, create it
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth[0],
      true
    );

    const signature = await program.methods
      .depositNft()
      .accounts({
        owner: keypair.publicKey,
        ownerAta: ownerAta.address,
        vaultState,
        vaultAuth: vaultAuth[0],
        vaultAta: vaultAta.address,
        tokenMint: mint,
        nftMetadata: metadataAccount,
        nftMasterEdition: masterEdition,
        metadataProgram, // not needed as anchor deduces this from the IDL
        tokenProgram: TOKEN_PROGRAM_ID, // not needed as anchor deduces this from the IDL
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, // not needed as anchor deduces this from the IDL
        systemProgram: SystemProgram.programId, // not needed as anchor deduces this from the IDL
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

//https://explorer.solana.com/tx/5C9b957B8SHkPrubpgWDeA6EKWu1fLWvm9a3USar3HjEbpottYaip18gQ36BmaoZmFK9NeYQS24nU7bnryposM41?cluster=devnet
