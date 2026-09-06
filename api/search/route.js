import { NextResponse } from "next/server";

const CJ_TOKEN_URL =
  "https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken";

const CJ_PRODUCT_URL =
  "https://developers.cjdropshipping.com/api2.0/v1/product/listV2";

const PAGE_SIZE = 100;

async function getCJAccessToken() {
  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey) {
    throw new Error("CJ_API_KEY is not configured.");
  }

  const response = await fetch(CJ_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `CJ authentication failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  const token =
    data?.data?.accessToken ||
    data?.data?.access_token ||
    data?.accessToken ||
    data?.access_token;

  if (!token) {
    throw new Error("CJ authentication succeeded but no access token was returned.");
  }

  return token;
}

function getProductId(product) {
  return (
    product?.pid ||
    product?.productId ||
    product?.id ||
    product?.product_id ||
    null
  );
}

function getProductName(product) {
  return (
    product?.productNameEn ||
    product?.productName ||
    product?.name ||
    product?.product_name ||
    ""
  );
}

function getProductImage(product) {
  return (
    product?.productImage ||
    product?.productImageUrl ||
    product?.image ||
    product?.imageUrl ||
    product?.product_img ||
    product?.productImg ||
    ""
  );
}

function getProductCost(product) {
  const possiblePrices = [
    product?.sellPrice,
    product?.price,
    product?.productPrice,
    product?.minPrice,
    product?.salePrice,
    product?.cost,
    product?.supplierPrice,
  ];

  for (const value of possiblePrices) {
    const number = Number(value);

    if (Number.isFinite(number) && number > 0) {
      return number;
    }
  }

  return null;
}

function flattenProducts(data) {
  const results = [];

  function walk(value) {
    if (!value) return;

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
      return;
    }

    if (typeof value !== "object") return;

    const name = getProductName(value);
    const image = getProductImage(value);
    const cost = getProductCost(value);

    if (name && image && cost !== null) {
      results.push(value);
    }

    if (Array.isArray(value.productList)) {
      walk(value.productList);
    }

    if (Array.isArray(value.products)) {
      walk(value.products);
    }

    if (Array.isArray(value.content)) {
      walk(value.content);
    }

    if (Array.isArray(value.list)) {
      walk(value.list);
    }

    if (Array.isArray(value.data)) {
      walk(value.data);
    }
  }

  walk(data);

  return results;
}

function uniqueProducts(products) {
  const seen = new Set();
  const output = [];

  for (const product of products) {
    const id = getProductId(product);

    const name = getProductName(product)
      .trim()
      .toLowerCase();

    const image = getProductImage(product)
      .trim()
      .toLowerCase();

    const key = id
      ? `id:${id}`
      : `fallback:${name}|${image}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(product);
  }

  return output;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = (searchParams.get("q") || "").trim();

    let page = Number(searchParams.get("page") || "1");
    let size = Number(searchParams.get("size") || PAGE_SIZE);

    if (!Number.isFinite(page) || page < 1) {
      page = 1;
    }

    if (!Number.isFinite(size) || size < 1) {
      size = PAGE_SIZE;
    }

    size = Math.min(Math.floor(size), PAGE_SIZE);

    const accessToken = await getCJAccessToken();

    const params = new URLSearchParams();

    params.set("page", String(Math.floor(page)));
    params.set("size", String(size));

    if (query) {
      params.set("keyWord", query);
    }

    const response = await fetch(`${CJ_PRODUCT_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "CJ-Access-Token": accessToken,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `CJ product request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    const rawProducts = flattenProducts(data);
    const products = uniqueProducts(rawProducts);

    const totalRecords =
      Number(
        data?.data?.totalRecords ??
          data?.data?.total ??
          data?.totalRecords ??
          data?.total ??
          0
      ) || 0;

    const currentPageProducts = products.length;

    /*
      CJ normally returns up to 100 products per page.

      We continue when:
      - CJ reports more total records, OR
      - the current page was full.

      We stop when:
      - the page contains fewer products than requested, AND
      - CJ did not report a larger total.

      This lets the Marlow front end continue requesting pages
      until CJ has no more products.
    */

    const hasMore =
      totalRecords > 0
        ? page * size < totalRecords
        : currentPageProducts >= size;

    return NextResponse.json({
      success: true,
      products,
      query,
      searchedCJ: true,
      page,
      size,
      returnedProducts: products.length,
      totalRecords,
      hasMore,
    });
  } catch (error) {
    console.error("Marlow CJ search error:", error);

    return NextResponse.json(
      {
        success: false,
        products: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve products from CJ.",
      },
      {
        status: 500,
      }
    );
  }
}
