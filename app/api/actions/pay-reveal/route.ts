import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

const headers = createActionHeaders();

export function GET() {
  const Payload: ActionGetResponse = {
    type: "action",
    title: "Pay to Reveal",
    description: "Pay 1SEND to reveal the secret information",
    label: "pay",
    icon: "",
    links: {
      actions: [
        {
          href: "",
          label: "Pay 1SEND",
        },
      ],
    },
  };
  return Response.json(Payload, { headers });
}

export const OPTIONS = GET;

export async function POST(req: Request) {
  try {
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const toPubkey = new PublicKey("");
    const provider = new Connection(clusterApiUrl("mainnet-beta"));

    const amount = 0;
    const minimumBalance = await provider.getMinimumBalanceForRentExemption(0);
    if (amount * LAMPORTS_PER_SOL < minimumBalance) {
      throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
    }
    const { blockhash, lastValidBlockHeight } =
      await provider.getLatestBlockhash();

    const mint_address = new PublicKey(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    );

    const from = await getAssociatedTokenAddress(mint_address, account);

    const to = await getAssociatedTokenAddress(mint_address, toPubkey);

    const instruction = createTransferInstruction(
      from,
      to,
      account,
      amount * 1_000_000
    );

    const tx = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    }).add(instruction);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction: tx,
        message: "You have successful buyed me coffee Thank You",
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
