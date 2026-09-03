import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        {
          products: [],
          message: "Enter a product to search.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.CJ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          products: [],
          message: "CJ API key is not configured.",
        },
        { status: 500 }
      );
    }

    // Get a temporary CJ access token
    const tokenResponse = await fetch(
      "https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
        }),
        cache: "no-store",
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData?.data?.accessToken) {
      console.error("CJ authentication failed:", tokenData);

      return NextResponse.json(
        {
          products: [],
          message: "CJ authentication failed.",
        },
        { status: 502 }
      );
    }

    const accessToken = tokenData.data.accessToken;

    // Search CJ's product catalog
    const productResponse = await fetch(
      "https://developers.cjdropshipping.com/api2.0/v1/product/listV2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CJ-Access-Token": accessToken,
        },
        body: JSON.stringify({
          keyWord: query,
          pageNum: 1,
          pageSize: 20,
        }),
        cache: "no-store",
      }
    );

    const productData = await productResponse.json();

    if (!productResponse.ok) {
      console.error("CJ product search failed:", productData);

      return NextResponse.json(
        {
          products: [],
          message: "CJ product search failed.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      products: productData?.data?.list || [],
      query,
    });
  } catch (error) {
    console.error("CJ search error:", error);

    return NextResponse.json(
      {
        products: [],
        message: "Unable to connect to the CJ supplier catalog.",
      },
      { status: 500 }
    );
  }
}
