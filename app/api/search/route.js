export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return Response.json({
        products: [],
        message: "Enter a product to search.",
      });
    }

    const apiKey = process.env.CJ_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          products: [],
          message: "CJ API key is not configured.",
        },
        { status: 500 }
      );
    }

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
      return Response.json(
        {
          products: [],
          message: "CJ authentication failed.",
        },
        { status: 502 }
      );
    }

    const accessToken = tokenData.data.accessToken;

    const cjUrl = new URL(
      "https://developers.cjdropshipping.com/api2.0/v1/product/listV2"
    );

    cjUrl.searchParams.set("page", "1");
    cjUrl.searchParams.set("size", "20");
    cjUrl.searchParams.set("keyWord", query);

    const productResponse = await fetch(cjUrl.toString(), {
      method: "GET",
      headers: {
        "CJ-Access-Token": accessToken,
      },
      cache: "no-store",
    });

    const productData = await productResponse.json();

    if (!productResponse.ok) {
      return Response.json(
        {
          products: [],
          message: "CJ product search failed.",
        },
        { status: 502 }
      );
    }

    return Response.json({
      products: productData?.data?.content ?? [],
      query,
    });
  } catch (error) {
    console.error("CJ search error:", error);

    return Response.json(
      {
        products: [],
        message: "Something went wrong while searching CJ.",
      },
      { status: 500 }
    );
  }
}
