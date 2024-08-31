"use client";
import { useEffect, useState } from "react";
import useStore from "../../store/user";
import { useRouter } from "next/navigation";

export default function Page() {
  const accessToken = useStore((state) => state.accessToken);
  const shop_url = useStore((state) => state.storeUrl);

  const [product_data, setProduct_data] = useState([]);

  const router = useRouter();
  useEffect(() => {
    if (!shop_url || !accessToken) router.push("/");
  }, [shop_url, accessToken]);

  async function getAllProducts() {
    try {
      const response = await fetch(
        `/api/shopify?token=${accessToken}&shop_url=${encodeURIComponent(
          // handle the input -> token and URL can't have spaces
          // input validation using zod
          shop_url
        )}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    async function getData() {
      const data = await getAllProducts();
      setProduct_data(data);
    }
    getData();
  }, []);

  return (
    <div>
      <h1>accessToken: {accessToken}</h1>
      <h1>shop URL : {shop_url}</h1>
      {product_data && <div>data: {JSON.stringify(product_data)}</div>}
    </div>
  );
}
