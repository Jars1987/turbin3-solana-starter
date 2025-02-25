import wallet from '../keypair.json';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from '@metaplex-foundation/umi';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
    const image =
      'https://devnet.irys.xyz/BNJBAu3UK5Ncieq4AxajWo2gmooG9GHv6MWgLLqLuXC2';
    const metadata = {
      name: 'jars1987',
      symbol: 'JARS',
      description: 'NFT for Turbin3',
      image: image,
      attributes: [
        { trait_type: 'strength', value: '10' },
        { trait_type: 'defence', value: '2' },
      ],
      properties: {
        files: [
          {
            type: 'image/png',
            uri: image,
          },
        ],
      },
      creators: [
        {
          address: keypair.publicKey,
          share: 100,
        },
      ],
    };
    const myUri = await umi.uploader.uploadJson(metadata);
    console.log('Your metadata URI: ', myUri);
  } catch (error) {
    console.log('Oops.. Something went wrong', error);
  }
})();

//https://arweave.net/DnGqFXSNNCYCHXtAnFmpKmGZurZP1Shd4KbxLtEcPWTV
