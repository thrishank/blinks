"use client";
import useStore from "../store/user";
import { useRouter } from "next/navigation";

export default function Home() {
  const setAccessToken = useStore((state) => state.setAccessToken);
  const setStoreUrl = useStore((state) => state.setStoreUrl);

  const router = useRouter();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    router.push("/products");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          No Code Shopify Tool
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter the Shopify store access token"
            fn={setAccessToken}
          />
          <Input
            placeholder="Enter your Shopify website URL"
            fn={setStoreUrl}
          />
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  fn,
  placeholder,
}: {
  placeholder: string;
  fn(text: string): any;
}) {
  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => fn(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  );
}
