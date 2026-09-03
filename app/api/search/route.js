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

    // Get CJ access token
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

    if (
      !tokenResponse.ok ||
      tokenData?.code !== 200 ||
      !tokenData?.data?.accessToken
    ) {
      console.error("CJ authentication failed:", tokenData);

      return NextResponse.json(
        {
          products: [],
          message: "CJ authentication failed.",
          details: tokenData?.message || "Unknown CJ authentication error.",
        },
        { status: 502 }
      );
    }

    const accessToken = tokenData.data.accessToken;

    // Search CJ product catalog
    const cjUrl = new URL(
      "https://developers.cjdropshipping.com/api2.0/v1/product/listV2"
    );

    cjUrl.searchParams.set("page", "1");
    cjUrl.searchParams.set("size", "20");
    cjUrl.searchParams.set("keyWord", query);
    cjUrl.searchParams.set("countryCode", "US");
    cjUrl.searchParams.set("features", "enable_description");
    cjUrl.searchParams.set("sort", "desc");
    cjUrl.searchParams.set("orderBy", "0");

    const productResponse = await fetch(cjUrl.toString(), {
      method: "GET",
      headers: {
        "CJ-Access-Token": accessToken,
      },
      cache: "no-store",
    });

    const productData = await productResponse.json();

    if (
      !productResponse.ok ||
      productData?.code !== 200 ||
      productData?.result === false
    ) {
      console.error("CJ product search failed:", productData);

      return NextResponse.json(
        {
          products: [],
          message: "CJ product search failed.",
          details: productData?.message || "Unknown CJ product error.",
        },
        { status: 502 }
      );
    }

    const content = productData?.data?.content || [];

    const products = content.flatMap((group) =>
      Array.isArray(group?.productList) ? group.productList : []
    );

    return NextResponse.json({
      products,
      query,
      totalRecords: productData?.data?.totalRecords || products.length,
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
