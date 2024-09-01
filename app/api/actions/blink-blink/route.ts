import { PrismaClient } from "@prisma/client";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
  NextActionLink,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import QRCode from "qrcode";
const headers = createActionHeaders();

export function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const basehref = new URL(`/api/actions/blink-blink`, url.origin).toString();
    const payload: ActionGetResponse = {
      title: "create a blink within a blink",
      icon: new URL(`/blink.png`, url.origin).toString(),
      description: `Create a simple blink within this blink, you can set the title, description, image, the message to display after the payment, and the account to receive the payments`,
      label: "",
      links: {
        actions: [
          {
            label: "create the blink for 0.001 SOL",
            href: `${basehref}`,
            parameters: [
              {
                name: "title",
                label: "enter the title of the blink",
                type: "text",
                required: true,
              },
              {
                name: "image",
                label: "enter the image of the blink",
                type: "url",
                required: true,
              },
              {
                name: "description",
                label: "enter the description of the blink",
                type: "textarea",
                required: true,
              },
              {
                name: "account",
                label: "Account address to receive the payments",
                type: "text",
                required: true,
              },
              {
                name: "amount",
                label: "enter the default amount to receive",
                type: "number",
                required: true,
              },
              {
                name: "message",
                label: "enter the message to display after the payment",
                type: "textarea",
                required: true,
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
  const prisma = new PrismaClient();

  try {
    const url = new URL(req.url);

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

    const data: any = body.data!;

    const id = await prisma.blink.create({
      data: {
        title: data.title,
        image: data.image,
        description: data.description,
        account: data.account,
        amount: data.amount,
        message: data.message,
      },
    });

    const blink_url = new URL(
      `/api/actions/blink-blink/create?id=${id.id}`,
      url.origin
    );

    const provider = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet")
    );

    const { blockhash, lastValidBlockHeight } =
      await provider.getLatestBlockhash();

    const instruction = SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: new PublicKey("EXBdeRCdiNChKyD7akt64n9HgSXEpUtpPEhmbnm4L6iH"),
      lamports: 0.001 * LAMPORTS_PER_SOL,
    });

    const tx = new Transaction({
      feePayer: account,
      blockhash,
      lastValidBlockHeight,
    }).add(instruction);

    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      blink_url.toString()
    )}`;

    const qrCodeDataUrl = await QRCode.toDataURL(twitterIntentUrl);

    const payload2 = (): NextActionLink => {
      return {
        type: "inline",
        action: {
          title: `Blink Created Successfully`,
          icon: qrCodeDataUrl,
          label: `Completed`,
          description: `Scan this QR code to share your blink on Twitter. Also here is the url if you want to copy paste it ${blink_url.toString()}`,
          type: "completed",
        },
      };
    };

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction: tx,
        message: `Blink created successfully here is your url
        ${blink_url.toString()}
        make sure to copy it and share it with your followers on twitter/X`,
        links: {
          next: payload2(),
        },
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
