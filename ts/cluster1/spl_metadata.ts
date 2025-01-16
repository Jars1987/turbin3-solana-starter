import wallet from '../keypair.json';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from '@metaplex-foundation/umi';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';

// Define our Mint address
const mint = publicKey('5a3UUtHNrNwvKNVVd8Snr6f8AkmDh4wsVEC6jRLSQGcX');

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
  try {
    // Start here

    /* WHY METADATA IS OPTIONAL?*/
    let accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    let data: DataV2Args = {
      name: 'Turbin3 Test Token',
      symbol: 'TTT',
      uri: '', // we don't actually have a URI for this token
      sellerFeeBasisPoints: 0, // royalty fee
      creators: null, //For NFTs
      collection: null, //For NFTs
      uses: null, //For NFTs
    };
    let args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: false,
      collectionDetails: null,
    };
    let tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });
    let result = await tx.sendAndConfirm(umi);
    console.log(bs58.encode(result.signature));
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
