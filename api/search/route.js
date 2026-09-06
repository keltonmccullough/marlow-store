import { NextResponse } from "next/server";

const CJ_TOKEN_URL =
  "https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken";

const CJ_PRODUCT_URL =
  "https://developers.cjdropshipping.com/api2.0/v1/product/listV2";

const PAGE_SIZE = 100;

// CJ can limit lower-level accounts to 1 request per second.
// We use a little over 1 second to give the API some breathing room.
const CJ_REQUEST_GAP_MS = 1200;
const CJ_MAX_RETRIES = 4;

let cachedAccessToken = null;
let cachedTokenExpiresAt = 0;

let cjRequestQueue = Promise.resolve();
let lastCJRequestTime = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
  All CJ requests go through one queue so multiple browser requests
  cannot hit CJ at the same time from the same server instance.
*/
function queueCJRequest(requestFunction) {
  const job = cjRequestQueue.then(async () => {
    const now = Date.now();
    const waitTime =
      CJ_REQUEST_GAP_MS - (now - lastCJRequestTime);

    if (waitTime > 0) {
      await sleep(waitTime);
    }

    try {
      return await requestFunction();
    } finally {
      lastCJRequestTime = Date.now();
    }
  });

  cjRequestQueue = job.catch(() => {});

  return job;
}

async function getCJAccessToken() {
  const now = Date.now();

  // Reuse the existing token instead of requesting a new one every time.
  if (
    cachedAccessToken &&
    cachedTokenExpiresAt &&
    now < cachedTokenExpiresAt - 5 * 60 * 1000
  ) {
    return cachedAccessToken;
  }

  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey) {
    throw new Error("CJ_API_KEY is not configured in Vercel.");
  }

  const response = await queueCJRequest(() =>
    fetch(CJ_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey,
      }),
      cache: "no-store",
    })
  );

  const responseText = await response.text();

  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      `CJ authentication failed (${response.status}): ${
        data?.message || responseText || "Unknown error"
      }`
    );
  }

  const token =
    data?.data?.accessToken ||
    data?.data?.access_token ||
    data?.accessToken ||
    data?.access_token;

  if (!token) {
    throw new Error(
      "CJ authentication succeeded, but no access token was returned."
    );
  }

  cachedAccessToken = token;

  const expiryString =
    data?.data?.accessTokenExpiryDate ||
    data?.data?.access_token_expiry_date;

  const parsedExpiry = expiryString
    ? new Date(expiryString).getTime()
    : 0;

  // If CJ doesn't provide an expiry value, safely cache for 12 hours.
  cachedTokenExpiresAt =
    parsedExpiry && Number.isFinite(parsedExpiry)
      ? parsedExpiry
      : Date.now() + 12 * 60 * 60 * 1000;

  return cachedAccessToken;
}

function getProductId(product) {
  return (
    product?.id ||
    product?.pid ||
    product?.productId ||
    product?.product_id ||
    null
  );
}

function getProductName(product) {
  return (
    product?.nameEn ||
    product?.productNameEn ||
    product?.productName ||
    product?.name ||
    product?.product_name ||
    ""
  );
}

function getProductImage(product) {
  return (
    product?.bigImage ||
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
    product?.nowPrice,
    product?.sellPrice,
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

function isUsableProduct(product) {
  const name = getProductName(product);
  const image = getProductImage(product);
  const cost = getProductCost(product);

  return Boolean(
    name &&
      image &&
      cost !== null
  );
}

function flattenProducts(data) {
  const products = [];

  function walk(value) {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }

      return;
    }

    if (typeof value !== "object") {
      return;
    }

    /*
      CJ listV2 returns products inside:
      data.content[].productList[]
    */

    if (isUsableProduct(value)) {
      products.push(value);
    }

    if (Array.isArray(value.content)) {
      walk(value.content);
    }

    if (Array.isArray(value.productList)) {
      walk(value.productList);
    }

    if (Array.isArray(value.products)) {
      walk(value.products);
    }

    if (Array.isArray(value.list)) {
      walk(value.list);
    }

    if (Array.isArray(value.data)) {
      walk(value.data);
    }
  }

  walk(data);

  return products;
}

function uniqueProducts(products) {
  const seen = new Set();
  const result = [];

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
    result.push(product);
  }

  return result;
}

function isTooManyRequests(status, data, text) {
  if (status === 429) {
    return true;
  }

  const combined = `${data?.message || ""} ${text || ""}`.toLowerCase();

  return (
    combined.includes("too many requests") ||
    combined.includes("qps limit") ||
    combined.includes("rate limit")
  );
}

async function fetchCJProducts({
  accessToken,
  page,
  size,
  query,
}) {
  let lastError = null;

  for (let attempt = 0; attempt <= CJ_MAX_RETRIES; attempt++) {
    try {
      const response = await queueCJRequest(() => {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("size", String(size));

        if (query) {
          params.set("keyWord", query);
        }

        return fetch(
          `${CJ_PRODUCT_URL}?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "CJ-Access-Token": accessToken,
            },
            cache: "no-store",
          }
        );
      });

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {};
      }

      if (response.ok) {
        return data;
      }

      if (
        isTooManyRequests(
          response.status,
          data,
          responseText
        )
      ) {
        lastError = new Error(
          "CJ rate limit reached."
        );

        if (attempt < CJ_MAX_RETRIES) {
          // Give CJ additional time before trying again.
          await sleep(
            1500 + attempt * 1500
          );

          continue;
        }
      }

      throw new Error(
        `CJ product request failed (${response.status}): ${
          data?.message ||
          responseText ||
          "Unknown error"
        }`
      );
    } catch (error) {
      lastError = error;

      if (attempt < CJ_MAX_RETRIES) {
        await sleep(
          1500 + attempt * 1500
        );

        continue;
      }
    }
  }

  throw lastError || new Error(
    "CJ product request failed."
  );
}

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const query =
      (searchParams.get("q") || "").trim();

    let page = Number(
      searchParams.get("page") || "1"
    );

    let size = Number(
      searchParams.get("size") ||
        PAGE_SIZE
    );

    if (!Number.isFinite(page) || page < 1) {
      page = 1;
    }

    if (!Number.isFinite(size) || size < 1) {
      size = PAGE_SIZE;
    }

    page = Math.floor(page);
    size = Math.min(
      Math.floor(size),
      PAGE_SIZE
    );

    /*
      CJ listV2 currently supports pages 1-1000
      and up to 100 products per page.
    */
    if (page > 1000) {
      return NextResponse.json({
        success: true,
        products: [],
        query,
        searchedCJ: true,
        page,
        size,
        returnedProducts: 0,
        totalRecords: 0,
        totalPages: 0,
        hasMore: false,
      });
    }

    const accessToken =
      await getCJAccessToken();

    const data =
      await fetchCJProducts({
        accessToken,
        page,
        size,
        query,
      });

    const rawProducts =
      flattenProducts(data);

    const products =
      uniqueProducts(rawProducts);

    const cjData =
      data?.data || {};

    const totalRecords =
      Number(
        cjData?.totalRecords ??
          data?.totalRecords ??
          0
      ) || 0;

    const totalPages =
      Number(
        cjData?.totalPages ??
          data?.totalPages ??
          0
      ) || 0;

    /*
      Use CJ's own totalPages when available.
      Otherwise continue while the page was full.
    */
    const hasMore =
      totalPages > 0
        ? page < totalPages
        : rawProducts.length >= size;

    return NextResponse.json({
      success: true,
      products,
      query,
      searchedCJ: true,
      page,
      size,
      returnedProducts: products.length,
      totalRecords,
      totalPages,
      hasMore,
    });
  } catch (error) {
    console.error(
      "CJ search error:",
      error
    );

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
        status: 502,
      }
    );
  }
}
