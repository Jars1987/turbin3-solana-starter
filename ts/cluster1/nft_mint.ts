import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
} from '@metaplex-foundation/umi';
import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';

import wallet from '../../keypair.json';
import base58 from 'bs58';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

(async () => {
  let tx = await createNft(umi, {
    mint, //nftSigner
    name: 'Turbin3 Test Token',
    symbol: 'TTT', //not mandatory
    uri: '', //get this from running nft_metadata.ts and getting the link
    sellerFeeBasisPoints: percentAmount(0, 2),
  });
  let result = await tx.sendAndConfirm(umi);
  const signature = base58.encode(result.signature);

  console.log(
    `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
  );

  console.log('Mint Address: ', mint.publicKey);
})();

/*
Minting the NFT process
1- Upload the image as a generic file and get the image URI
2- Build the metadata JSON structure and upload it to get the metadata URI
3- Mint the NFT using the createNFT function (pass umi and then an object with the mint, name, symbol, uri, and sellerFeeBasisPoints)
Check Metaplex docs for more info
*/
