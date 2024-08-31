import { InlineNextActionLink, NextAction, PostNextActionLink } from "@dialectlabs/blinks";
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

export function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const baseHref = new URL(
      `/api/actions/test?to=${"VTwKNtmXi4TQCLZraksAkasMAJmgLgjVT6txUc4mjxN"}&steps=1`,
      url.origin,
    ).toString();

    const steps = url.searchParams.get("steps");

    switch (steps) {
      case "1":
        const payload: ActionGetResponse = {
          // icon: new URL("/solana_devs.jpg", url.origin).toString(),
          title: "Buy Floella Jumpsuit using crypto on twitter",
          icon: "https://www.blackhalo.com/cdn/shop/files/BH-511.jpg?v=1722030710&width=2000",
          description: `Floella features a one shoulder slip-style bodice with a gracefully draped asymmetrical overlay that buttons at one shoulder.`,
          label: "Buy Floella Jumpsuit",
          type: "action",

          links: {
            actions: [
              {
                label: 'Buy the product for 0.1 SOL',
                href: `${baseHref}&amount=${"0.1"}`,
                parameters: [
                  {
                    name: "email",
                    label: 'Enter your email address',
                    type: "email",
                    required: true,
                  },
                  {
                    name: "contact no",
                    label: 'Enter your phone number',
                    type: "text",
                    required: true,
                  },
                  {
                    name: "address",
                    label: 'Enter your shipping address',
                    type: "textarea",
                    required: true,
                  },
                  {
                    name: "Order Quantity",
                    label: 'Select quantity',
                    type: "number",
                    min: 1,
                    max: 5,
                    required: true,
                  },
                  {
                    name: "notes",
                    label: 'Additional notes or instructions',
                    type: "textarea",
                    required: false,
                  },
                ],
              },
              {
                label: 'send Transaction Signtaure',
                href: `${baseHref}&tx=""`,
                parameters: [
                  {
                    name: "Signature",
                    type: "text",
                    label: "Enter your signature"
                  }
                ]
              },
            ],

          },
        };

        return Response.json(payload, {
          headers,
        });
      case "2":
        const payload2: ActionGetResponse = {
          title: "send the details",
          icon: "https://www.blackhalo.com/cdn/shop/files/BH-511.jpg?v=1722030710&width=2000",
          description: "yooo",
          label: "WTF",
          type: "action",
          links: {
            actions: [
              {
                "label": "send Transaction Signtaure",
                "href": "http://localhost:3000/api/actions/test?to=VTwKNtmXi4TQCLZraksAkasMAJmgLgjVT6txUc4mjxN&steps=1&tx=\"\"",
                "parameters": [
                  {
                    "name": "Signature",
                    "type": "text",
                    "label": "Enter your signature"
                  }
                ]
              }
            ]
          }
        }
        return Response.json(payload2, {
          headers,
        });
      default:
        return Response.json("Err");
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
    const { amount, toPubkey } = validatedQueryParams(url);
    const body: ActionPostRequest = await req.json();

    const account: PublicKey = new PublicKey(body.account);

    const provider = new Connection(clusterApiUrl("devnet"));
    const steps = url.searchParams.get("steps");

    const { blockhash, lastValidBlockHeight } =
      await provider.getLatestBlockhash();

    switch (steps) {
      case "1":
        console.log(body.data);
        // send a address data as a email to merchant 
        // send a confirmation email to user,
        // also store the data on-chain 

        const dataBuffer = Buffer.from(JSON.stringify(body.data), "utf-8");

        const transaction1 = new Transaction({
          feePayer: account,
          blockhash,
          lastValidBlockHeight,
        }).add(SystemProgram.transfer({
          fromPubkey: new PublicKey(body.account),
          toPubkey: toPubkey,
          lamports: 1
        }))

        // const inlineNextAction: InlineNextActionLink = {
        //   type: "inline",
        //   action: nextAction,
        // };
        const NextAction: PostNextActionLink = {
          href: "/api/actions/test?steps=2&to=VTwKNtmXi4TQCLZraksAkasMAJmgLgjVT6txUc4mjxN&amount=0.1",
          type: "post"
        }
        const payload1: ActionPostResponse = await createPostResponse({
          fields: {
            message: "Data sent securly onchain",
            transaction: transaction1,
            links: {
              next: NextAction,
            }
          }
        })

        return Response.json(payload1, {
          headers,
        });

      case "2":
        const rent = await provider.getMinimumBalanceForRentExemption(0);

        if (amount * LAMPORTS_PER_SOL < rent) {
          throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
        }

        const instruction = SystemProgram.transfer({
          fromPubkey: account,
          toPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        });
        const transaction = new Transaction({
          feePayer: account,
          blockhash,
          lastValidBlockHeight,
        }).add(instruction);


        const nextAction: NextAction = {
          type: 'action',
          label: "SDfa",
          icon: "",
          title: "hello",
          description: "what thr fun",
          links: {
            actions: [
              {
                label: "Test",
                href: `localhost:3000/api/actions/test?step=2`
              }
            ]
          }
        };

        const payload: ActionPostResponse = await createPostResponse({
          fields: {
            transaction,
            message: `Send ${amount} SOL to ${toPubkey.toBase58()} and the signature is ${transaction.signature}`
          },
        });

        return Response.json(nextAction, {
          headers,
        });

      default:
        return Response.json("Err");
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

function validatedQueryParams(requestUrl: URL) {
  const amountString = requestUrl.searchParams.get("amount");
  const toPubkeyString = requestUrl.searchParams.get("to");

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
