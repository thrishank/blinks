import { NextActionLink } from "@dialectlabs/blinks";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { generateHeatmap } from "./fn";
import fs from "fs";

const headers = createActionHeaders();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const payload: ActionGetResponse = {
    type: "action",
    title: "Solana wallet Activity",
    description:
      "Check your solana transaction activity from last one year and mint the transaction heatmap NFT easily using this blink",
    label: "stats",
    icon: "https://stats-5em0.onrender.com/stats.png",
    links: {
      actions: [
        {
          label: "SEND",
          href: "/api/actions/stats?account={account}",
          parameters: [
            {
              label: "Enter wallet adddres",
              type: "text",
              name: "account",
            },
          ],
        },
        {
          href: "/api/actions/stats",
          label: "Connect Your wallet",
        },
      ],
    },
  };
  return Response.json(payload, { headers });
}

export const OPTIONS = GET;

export async function POST(req: Request) {
  const body: ActionPostRequest = await req.json();

  const url = new URL(req.url);
  let stat_account: PublicKey | null = url.searchParams.get("account")
    ? new PublicKey(url.searchParams.get("account")!)
    : null;

  let account: PublicKey;
  try {
    account = new PublicKey(body.account);
  } catch (err) {
    return new Response('Invalid "account" provided', {
      status: 400,
      headers,
    });
  }
  if (!stat_account) {
    stat_account = account;
  }

  const provider = new Connection(
    process.env.SOLANA_RPC! ||
      "https://devnet.helius-rpc.com/?api-key=20475b23-b7f2-46be-badc-ad4f62baf079",
    { commitment: "confirmed" }
  );

  const { blockhash, lastValidBlockHeight } =
    await provider.getLatestBlockhash();

  const toPubkey: PublicKey = new PublicKey(
    "VTwKNtmXi4TQCLZraksAkasMAJmgLgjVT6txUc4mjxN"
  );

  const instruction = SystemProgram.transfer({
    fromPubkey: account,
    toPubkey,
    lamports: 0 * LAMPORTS_PER_SOL,
  });

  const tx = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  }).add(instruction);

  let totalTx = 0;
  let oldestSignature;

  const dates: number[] = [];

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  const oneYearAgo = Math.floor(Date.now() / 1000) - ONE_YEAR_IN_SECONDS;

  while (true) {
    try {
      const signatures = await provider.getSignaturesForAddress(stat_account, {
        before: oldestSignature,
        limit: 1000,
      });
      if (signatures.length === 0) break;
      totalTx += signatures.length;
      console.log(signatures.length);

      let stopLoop = false;

      for (const sig of signatures) {
        if (sig.blockTime) {
          if (sig.blockTime < oneYearAgo) {
            stopLoop = true;
            break;
          }
          dates.push(sig.blockTime);
        }
      }

      if (stopLoop) break;
      oldestSignature = signatures[signatures.length - 1].signature;
    } catch (err) {
      console.log(err);
      break;
    }
  }
  const heatmapDataUri = generateHeatmap(dates);

  const heatmapBuffer = Buffer.from(heatmapDataUri.split(",")[1], "base64");

  fs.writeFileSync(
    `/var/task/stats/public/stats/${stat_account}.png`,
    heatmapBuffer
  );

  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction: tx,
      message: `you have done a overall of ${totalTx} transactions`,
      links: {
        next: {
          href: `/api/actions/stats/next-action?account=${stat_account}`,
          type: "post",
        },
      },
    },
  });
  return Response.json(payload, { headers });
}
