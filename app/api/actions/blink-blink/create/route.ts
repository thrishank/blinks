import { PrismaClient } from "@prisma/client";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const headers = createActionHeaders();
const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const basehref = url.href;
    const id = url.searchParams.get("id")!;

    const data = await prisma.blink.findUnique({
      where: {
        id: id,
      },
    });

    if (data) {
      const payload: ActionGetResponse = {
        title: data.title,
        icon: data.image,
        description: data.description,
        label: "Blink",
        type: "action",
        links: {
          actions: [
            {
              label: `SEND ${data.amount} SOL`,
              href: `${basehref}&amount=${data.amount}&account=${data.account}&message=${data.message}`,
            },
            {
              label: "send",
              href: `${basehref}&amount={amount}&account=${data.account}&message=${data.message}`,
              parameters: [
                {
                  name: "amount",
                  label: "enter a custom amount",
                  type: "number",
                },
              ],
            },
          ],
        },
      };
      return Response.json(payload, { headers });
    }
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
    const message = url.searchParams.get("message");
    const body: ActionPostRequest = await req.json();

    const { toPubkey, amount } = validatedQueryParams(url);

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const provider = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet")
    );

    const { blockhash, lastValidBlockHeight } =
      await provider.getLatestBlockhash();

    const tx = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    });

    const instruction = SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: toPubkey,
      lamports: amount * LAMPORTS_PER_SOL,
    });

    tx.add(instruction);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction: tx,
        message: message!,
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
  const toPubkeyString = requestUrl.searchParams.get("account");

  if (!amountString || !toPubkeyString) {
    throw new Error("Missing required query parameters");
  }

  const amount = parseFloat(amountString);
  const toPubkey = new PublicKey(toPubkeyString);

  return {
    amount,
    toPubkey,
  };
}
