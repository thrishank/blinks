import {
    ActionError,
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
    PublicKey,
    Transaction,
  } from "@solana/web3.js";
  
  const headers = createActionHeaders();
  export function GET(req: Request) {
    try {
      const url = new URL(req.url);
      const basehref = new URL(`/api/actions/poll?`, url.origin).toString();
  
      const payload: ActionGetResponse = {
        title: "SEND Token Airdrop Proposal",
        icon: new URL(`/send.png`, url.origin).toString(),
        description: `Proposal: Airdrop 25 SEND tokens to each blinkathon participant. Only SEND Token Holders can vote this blink. Claim your vote for 1 SEND. Your vote matters! Help decide the future of SEND token distribution.`,
        label: "SEND",
        type: "action",
        links: {
          actions: [
            {
              label: "Yes",
              href: `${basehref}vote=0`,
            },
            {
              label: "No",
              href: `${basehref}vote=1`,
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
      const SOLANA_RPC = process.env.SOLANA_RPC || clusterApiUrl("devnet");
      const provider = new Connection(SOLANA_RPC);
  
      const url = new URL(req.url);
      const body: ActionPostRequest = await req.json();
  
      const vote = url.searchParams.get("vote");
  
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
  
      const mint_address = new PublicKey(
        "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa"
        // "9jyEAn15hMY7f5iKdUTPE5ZGaxD4BfsbHggwHFYvgF61"
      );
  
      try {
        var from = await getAssociatedTokenAddress(mint_address, account);
        const tokenAccount = await provider.getTokenAccountBalance(from);
  
        if (tokenAccount.value.uiAmount! < 1) {
          throw new Error("You don't have enough SEND tokens to vote");
        }
      } catch (err) {
        console.log(err);
        let message =
          "Only SEND token holders can vote this poll. Seem's like you're not a SEND token Holder Buy some SEND first and then vote";
        return Response.json({ message } as ActionError, {
          status: 403,
          headers,
        });
      }
  
      const toPubkey = new PublicKey(
        "EXBdeRCdiNChKyD7akt64n9HgSXEpUtpPEhmbnm4L6iH"
      );
      const to = await getAssociatedTokenAddress(mint_address, toPubkey);
  
      const instruction = createTransferInstruction(
        from,
        to,
        account,
        1 * 1_000_000
      );
  
      const tx = new Transaction({
        feePayer: account,
        blockhash,
        lastValidBlockHeight,
      }).add(instruction);
  
      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          transaction: tx,
          message: "You have successful voted for this SEND Airdrop Proposal",
          links: {
            next: {
              href: `/api/actions/poll/next-action?vote=${vote}`,
              type: "post",
            },
          },
        },
      });
      return Response.json(payload, { headers });
    } catch (err) {
      console.log(err);
      let message = "An unknown error occurred";
      return new Response(message, {
        status: 400,
        headers,
      });
    }
  }
  