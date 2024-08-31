import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const token = searchParams.get("token");
    const shop_url = searchParams.get("shop_url")

    console.log(token, shop_url)
    if (typeof token !== 'string' || typeof shop_url !== 'string') {
        return NextResponse.json({ error: 'Invalid token or website_url' }, { status: 400 });
    }

    let url = `https://${shop_url}/admin/api/2024-07/products.json?limit=5`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Shopify-Access-Token": token,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}