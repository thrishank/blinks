import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  AccountLayout,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const headers = createActionHeaders();

export function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const basehref = new URL(`/api/actions/coffee?`, url.origin).toString();
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
            label: "Buy me a cofee for 1$",
            href: `${basehref}amount=${"1"}`,
          },
          {
            label: "send",
            href: `${basehref}amount={amount}`,
            parameters: [
              {
                name: "amount",
                label: "enter a custom amount",
                type: "number",
                min: 0.5,
              },
            ],
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

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);

    const body: ActionPostRequest = await req.json();

    const { amount, toPubkey } = validatedQueryParams(url);

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const provider = new Connection(clusterApiUrl("mainnet-beta"));

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

function validatedQueryParams(requestUrl: URL) {
  const amountString = requestUrl.searchParams.get("amount");
  const toPubkeyString = "DRgXaLJjRej9mQsae8iYpswHzRwdDFchFJns2WNPTwbs";

  if (!amountString) {
    throw new Error("Missing the amount query parameters");
  }

  const amount = parseFloat(amountString);
  const toPubkey = new PublicKey(toPubkeyString);

  return {
    amount,
    toPubkey,
  };
}
