"use client";
import { Blink, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

export default function Page({ params }: { params: { blink: string } }) {
  const actionApiUrl =
    "http://localhost:3000/api/actions/test?to=VTwKNtmXi4TQCLZraksAkasMAJmgLgjVT6txUc4mjxN&amount=1";

  const { adapter } = useActionSolanaWalletAdapter(clusterApiUrl("devnet"));
  if (!actionApiUrl) {
    throw new Error("Provide action API url");
  }

  const { action } = useAction({ url: actionApiUrl, adapter });
  return (
    <div>
      <div id="Editor">{params.blink}</div>
      <div id="Blink-live">
        <WalletModalProvider>
          <div className="mt-5 p-5 border-2 border-gray-300 rounded-lg bg-gray-50 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Blink Action
            </h2>
            {action && (
              <Blink
                action={action}
                websiteText={new URL(actionApiUrl).hostname}
              />
            )}
          </div>
        </WalletModalProvider>
      </div>
    </div>
  );
}
