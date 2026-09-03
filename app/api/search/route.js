import { NextResponse } from "next/server";

const CJ_BASE_URL =
  "https://developers.cjdropshipping.com/api2.0/v1";

const MAX_PRODUCTS = 150;
const PAGE_SIZE = 50;
const MAX_PAGES = 3;

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
    "";

  return typeof image === "string"
    ? image.trim()
    : "";
}

function getProductCost(product) {
  const possibleValues = [
    product?.nowPrice,
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
  page
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
    String(PAGE_SIZE)
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

    if (!query) {
      return NextResponse.json(
        {
          products: [],
          query: "",
          searchedCJ: false,
          message:
            "Enter a product to search.",
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.CJ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          products: [],
          query,
          searchedCJ: false,
          message:
            "CJ API key is not configured.",
        },
        { status: 500 }
      );
    }

    /*
      Authenticate with CJ.
    */

    const accessToken =
      await getCJAccessToken(
        apiKey
      );

    /*
      Search several CJ pages instead
      of stopping after the first 20
      products.

      Example:

      page 1 = up to 50
      page 2 = up to 50
      page 3 = up to 50

      Maximum returned = 150
    */

    const allProducts = [];

    let totalRecords = 0;

    for (
      let page = 1;
      page <= MAX_PAGES;
      page++
    ) {
      const data =
        await searchCJPage(
          accessToken,
          query,
          page
        );

      const pageProducts =
        extractProducts(data);

      totalRecords =
        Number(
          data?.data
            ?.totalRecords
        ) ||
        totalRecords ||
        0;

      allProducts.push(
        ...pageProducts
      );

      /*
        Stop early if CJ doesn't
        have another page.
      */

      if (
        pageProducts.length <
        PAGE_SIZE
      ) {
        break;
      }

      /*
        Stop once we have enough
        products for this request.
      */

      if (
        allProducts.length >=
        MAX_PRODUCTS
      ) {
        break;
      }

      /*
        If CJ tells us the total
        number of records and we've
        reached them, stop.
      */

      if (
        totalRecords > 0 &&
        allProducts.length >=
          totalRecords
      ) {
        break;
      }
    }

    /*
      Remove products that don't have
      enough information to display
      properly.
    */

    const usableProducts =
      allProducts.filter(
        productLooksUsable
      );

    /*
      Remove duplicate products.

      CJ can sometimes return the
      same product in different
      groups/pages.
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
      ).slice(
        0,
        MAX_PRODUCTS
      );

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
      pagesChecked:
        Math.min(
          MAX_PAGES,
          Math.ceil(
            allProducts.length /
              PAGE_SIZE
          ) || 1
        ),
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
        message:
          "Unable to connect to the CJ supplier catalog.",
        details:
          error?.message ||
          "Unknown CJ error.",
      },
      { status: 502 }
    );
  }
}
