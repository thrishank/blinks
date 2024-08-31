import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  transfer,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { createNFT_GIT } from "./nft";
import wallet from "../../../../wallet.json";
const headers = createActionHeaders();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const basehref = new URL(`/api/actions/mint-test`, url.origin).toString();
    const payload: ActionGetResponse = {
      title: "Buy me a cofee",
      icon: "https://media-cdn.tripadvisor.com/media/photo-s/04/4c/1c/f9/starbucks-aqua-city-odaiba.jpg",
      description:
        "Buy me a cofee direclty on twitter with blockchain links powered by dialect and solana",
      label: "Buy me a coffee for 0.5$",
      type: "action",
      links: {
        actions: [
          {
            label: "mint",
            href: `${basehref}`,
          },
        ],
      },
    };
    return Response.json(payload, { headers });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { headers });
}

const provider = new Connection(clusterApiUrl("devnet"), {
  commitment: "confirmed",
});

export async function POST(req: Request) {
  try {
    const body: ActionPostRequest = await req.json();

    const myAccount = Keypair.fromSecretKey(new Uint8Array(wallet));
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const { blockhash, lastValidBlockHeight } =
      await provider.getLatestBlockhash();

    const instruction = SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: myAccount.publicKey,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    });

    const t1 = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    }).add(instruction);

    const nft = await createNFT_GIT();
    const mint_address = new PublicKey(nft!);

    const from = await getAssociatedTokenAddress(
      mint_address,
      myAccount.publicKey
    );

    const to = await getOrCreateAssociatedTokenAccount(
      provider,
      myAccount,
      mint_address,
      account
    );

    const tx = await transfer(
      provider,
      myAccount,
      from,
      to.address,
      myAccount,
      1
    );

    console.log(tx);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction: t1,
        message: `You have successful minted the NFT here is the transaction hash ${tx}`,
      },
    });

    return Response.json(payload, { headers });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
}
