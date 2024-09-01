import { createActionHeaders, ActionError, NextAction } from "@solana/actions";

const headers = createActionHeaders();

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

    const stat_account = url.searchParams.get("account");

    const payload: NextAction = {
      type: "action",
      title: "mint the NFT for 0.01 SOL",
      icon: `https://stats-5em0.onrender.com/stats/${stat_account}.png`,
      // icon: new URL(`/stats/${stat_account}.png`, url.origin).toString(),
      label: "Complete!",
      description: `Mint this tweet for 1$`,
      links: {
        actions: [
          {
            label: "mint tweet",
            href: `/api/actions/stats/next-action/mint?account=${stat_account}`,
          },
        ],
      },
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
