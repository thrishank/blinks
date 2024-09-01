/**
 * Solana Action chaining example
 */

import {
  createActionHeaders,
  NextActionPostRequest,
  ActionError,
  CompletedAction,
} from "@solana/actions";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { createBarGraph } from "../fn";
import { PrismaClient } from "@prisma/client";

const headers = createActionHeaders();
const prisma = new PrismaClient();
/**
 * since this endpoint is only meant to handle the callback request
 * for the action chaining, it does not accept or process GET requests
 */
export const GET = async (req: Request) => {
  return Response.json({ message: "Method not supported" } as ActionError, {
    status: 403,
    headers,
  });
};

export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);

    const body: NextActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      throw 'Invalid "account" provided';
    }

    let signature: string;
    try {
      signature = body.signature;
      if (!signature) throw "Invalid signature";
    } catch (err) {
      throw 'Invalid "signature" provided';
    }

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet")
    );

    try {
      let status = await connection.getSignatureStatus(signature);

      console.log("signature status:", status);

      if (!status) throw "Unknown signature status";

      // only accept `confirmed` and `finalized` transactions
      if (status.value?.confirmationStatus) {
        if (
          status.value.confirmationStatus != "confirmed" &&
          status.value.confirmationStatus != "finalized"
        ) {
          throw "Unable to confirm the transaction";
        }
      }

      // todo: check for a specific confirmation status if desired
      // if (status.value?.confirmationStatus != "confirmed")
    } catch (err) {
      if (typeof err == "string") throw err;
      throw "Unable to confirm the provided signature";
    }

    const vote = url.searchParams.get("vote");
    const voteValue = parseInt(vote!);

    try {
      if (voteValue == 0) {
        await prisma.vote.create({
          data: {
            personId: account.toString(),
            choice: "0",
          },
        });
      } else if (voteValue == 1) {
        await prisma.vote.create({
          data: {
            personId: account.toString(),
            choice: "1",
          },
        });
      } else {
        throw `invalid vote`;
      }
    } catch (err) {
      throw err;
    }

    const image = await createVoteGraph();

    const payload: CompletedAction = {
      type: "completed",
      title: "Vote Confirmation",
      icon: image,
      label: "Complete!",
      description: `Your vote has been successfully claimed. Thank You for participating in the blink Airdrop Proposal`,
    };

    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    let actionError: ActionError = { message: "An unknown error occurred" };
    if (typeof err == "string") actionError.message = err;
    return Response.json(actionError, {
      status: 400,
      headers,
    });
  }
};

const createVoteGraph = async () => {
  const yes = await prisma.vote.count({
    where: {
      choice: "0",
    },
  });

  const no = await prisma.vote.count({
    where: {
      choice: "1",
    },
  });

  const image = createBarGraph(yes, no);
  return image;
};
