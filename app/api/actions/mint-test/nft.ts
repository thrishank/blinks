import wallet from "../../../../wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";
import {
  mplTokenMetadata,
  createNft,
} from "@metaplex-foundation/mpl-token-metadata";
import base58 from "bs58";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

export const createNFT_GIT = async () => {
  try {
    const imageupload = await readFile("/blinks-shopify/public/send.png");
    const imageConv = createGenericFile(imageupload, "github-rug", {
      tags: [
        {
          name: "Content-Type",
          value: "image/png",
        },
      ],
    });

    const image = await umi.uploader.upload([imageConv]);
    console.log("image upload", image);

    const metadata = {
      name: "tx activity stats",
      symbol: "TXH",
      description:
        "transaction heat map of this wallet address for the last one year",
      image: image[0],
      attributes: [{ trait_type: "material", value: "?" }],
      properties: {
        files: [
          {
            type: "image/png",
            uri: image[0],
          },
        ],
        category: "image",
      },
      seller_fee_basis_points: 100,
      creators: [
        {
          address: signer.publicKey.toString(),
          share: 100,
        },
      ],
    };
    const myUri = await umi.uploader.uploadJson(metadata);
    console.log("Your image URI: ", myUri);

    umi.use(mplTokenMetadata());

    const mint = generateSigner(umi);

    let tx = createNft(umi, {
      mint,
      name: "Transaction Account Heatmap",
      symbol: "txh",
      sellerFeeBasisPoints: percentAmount(1),
      uri: myUri,
    });
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    console.log("Signature", signature);

    console.log("Mint Address: ", mint.publicKey);
    return mint.publicKey;
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
};
