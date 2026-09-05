import { NextResponse } from "next/server";

const CJ_BASE_URL =
  "https://developers.cjdropshipping.com/api2.0/v1";

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

function getProductId(product) {
  return (
    product?.pid ||
    product?.productId ||
    product?.id ||
    product?.sku ||
    product?.productSku ||
    null
  );
}

function getProductName(product) {
  return (
    product?.productName ||
    product?.nameEn ||
    product?.name ||
    product?.title ||
    product?.productTitle ||
    ""
  )
    .toString()
    .trim();
}

function getProductImage(product) {
  const image =
    product?.bigImage ||
    product?.productImage ||
    product?.productImageUrl ||
    product?.image ||
    product?.imageUrl ||
    product?.img ||
    product?.skuImage ||
    "";

  return typeof image === "string"
    ? image.trim()
    : "";
}

function getProductCost(product) {
  const possibleValues = [
    product?.nowPrice,
    product?.discountPrice,
    product?.sellPrice,
    product?.productPrice,
    product?.price,
    product?.minPrice,
    product?.costPrice,
  ];

  for (const value of possibleValues) {
    const number = Number(value);

    if (
      Number.isFinite(number) &&
      number > 0
    ) {
      return number;
    }
  }

  return 0;
}

function productLooksUsable(product) {
  const name = getProductName(product);
  const image = getProductImage(product);
  const cost = getProductCost(product);

  return Boolean(
    name &&
      image &&
      cost > 0
  );
}

function extractProducts(data) {
  const content =
    Array.isArray(data?.data?.content)
      ? data.data.content
      : [];

  return content.flatMap((group) => {
    if (
      Array.isArray(
        group?.productList
      )
    ) {
      return group.productList;
    }

    return [];
  });
}

async function getCJAccessToken(apiKey) {
  const response = await fetch(
    `${CJ_BASE_URL}/authentication/getAccessToken`,
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

  const data =
    await response.json();

  if (
    !response.ok ||
    data?.code !== 200 ||
    !data?.data?.accessToken
  ) {
    console.error(
      "CJ authentication failed:",
      data
    );

    throw new Error(
      data?.message ||
        "CJ authentication failed."
    );
  }

  return data.data.accessToken;
}

async function searchCJPage(
  accessToken,
  query,
  page,
  size
) {
  const url = new URL(
    `${CJ_BASE_URL}/product/listV2`
  );

  url.searchParams.set(
    "page",
    String(page)
  );

  url.searchParams.set(
    "size",
    String(size)
  );

  url.searchParams.set(
    "keyWord",
    query
  );

  url.searchParams.set(
    "countryCode",
    "US"
  );

  url.searchParams.set(
    "features",
    "enable_description"
  );

  url.searchParams.set(
    "sort",
    "desc"
  );

  url.searchParams.set(
    "orderBy",
    "0"
  );

  const response = await fetch(
    url.toString(),
    {
      method: "GET",
      headers: {
        "CJ-Access-Token":
          accessToken,
      },
      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (
    !response.ok ||
    data?.code !== 200 ||
    data?.result === false
  ) {
    console.error(
      `CJ product search failed on page ${page}:`,
      data
    );

    throw new Error(
      data?.message ||
        "CJ product search failed."
    );
  }

  return data;
}

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const query =
      searchParams
        .get("q")
        ?.trim();

    const requestedPage =
      Number(
        searchParams.get("page") ||
          "1"
      );

    const requestedSize =
      Number(
        searchParams.get("size") ||
          String(DEFAULT_PAGE_SIZE)
      );

    if (!query) {
      return NextResponse.json(
        {
          products: [],
          query: "",
          searchedCJ: false,
          totalRecords: 0,
          returnedProducts: 0,
          page: 1,
          size: DEFAULT_PAGE_SIZE,
          message:
            "Enter a product to search.",
        },
        { status: 400 }
      );
    }

    const page =
      Number.isFinite(requestedPage) &&
      requestedPage >= 1
        ? Math.floor(requestedPage)
        : 1;

    const size =
      Number.isFinite(requestedSize) &&
      requestedSize >= 1
        ? Math.min(
            Math.floor(requestedSize),
            MAX_PAGE_SIZE
          )
        : DEFAULT_PAGE_SIZE;

    const apiKey =
      process.env.CJ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          products: [],
          query,
          searchedCJ: false,
          totalRecords: 0,
          returnedProducts: 0,
          page,
          size,
          message:
            "CJ API key is not configured.",
        },
        { status: 500 }
      );
    }

    /*
      Authenticate with CJ.

      The access token stays on
      the server and is never sent
      to the customer's browser.
    */

    const accessToken =
      await getCJAccessToken(
        apiKey
      );

    /*
      Search the requested CJ page.

      The frontend normally requests
      100 products at a time.

      When the customer clicks
      "Load more products", page.js
      requests page 2, page 3, etc.
    */

    const data =
      await searchCJPage(
        accessToken,
        query,
        page,
        size
      );

    const pageProducts =
      extractProducts(data);

    const totalRecords =
      Number(
        data?.data?.totalRecords
      ) || 0;

    /*
      Keep only products that have
      a usable name, image, and price.
    */

    const usableProducts =
      pageProducts.filter(
        productLooksUsable
      );

    /*
      Remove duplicates from this
      response page.

      This prevents CJ duplicate
      records from appearing twice.
    */

    const uniqueProducts =
      Array.from(
        new Map(
          usableProducts.map(
            (product, index) => {
              const id =
                getProductId(
                  product
                ) ||
                `${getProductName(
                  product
                )}-${getProductImage(
                  product
                )}-${index}`;

              return [
                String(id),
                product,
              ];
            }
          )
        ).values()
      );

    /*
      Determine whether another page
      is available.

      If CJ tells us the total number
      of records, use that.

      Otherwise, a full page means
      there may be another page.
    */

    const hasMore =
      totalRecords > 0
        ? page * size <
          totalRecords
        : uniqueProducts.length >=
          size;

    return NextResponse.json({
      products:
        uniqueProducts,

      query,

      searchedCJ: true,

      totalRecords:
        totalRecords ||
        uniqueProducts.length,

      returnedProducts:
        uniqueProducts.length,

      page,

      size,

      hasMore,
    });
  } catch (error) {
    console.error(
      "CJ search error:",
      error
    );

    return NextResponse.json(
      {
        products: [],
        searchedCJ: true,
        totalRecords: 0,
        returnedProducts: 0,
        message:
          "Unable to connect to the product catalog right now. Please try again.",
        details:
          error?.message ||
          "Unknown catalog error.",
      },
      { status: 502 }
    );
  }
}
