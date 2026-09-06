import { NextResponse } from "next/server";

const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const CJ_AUTH_URL = `${CJ_BASE_URL}/authentication/getAccessToken`;
const CJ_PRODUCT_URL = `${CJ_BASE_URL}/product/listV2`;

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 1000;

let cachedAccessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey) {
    throw new Error("CJ_API_KEY is not configured in Vercel.");
  }

  // Reuse the token instead of requesting a new token for every product request.
  if (
    cachedAccessToken &&
    Date.now() < tokenExpiresAt
  ) {
    return cachedAccessToken;
  }

  const response = await fetch(CJ_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey,
    }),
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json) {
    throw new Error(
      json?.message ||
        `CJ authentication failed with HTTP ${response.status}.`
    );
  }

  const token =
    json?.data?.accessToken ||
    json?.data?.access_token ||
    json?.accessToken;

  if (!token) {
    throw new Error(
      json?.message || "CJ did not return an access token."
    );
  }

  cachedAccessToken = token;

  // Keep a safety margin before the token expires.
  // CJ access tokens are long-lived, so this prevents unnecessary auth calls.
  tokenExpiresAt = Date.now() + 12 * 60 * 60 * 1000;

  return cachedAccessToken;
}

function cleanNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value)
    .replace(/[$,\s]/g, "")
    .trim();

  if (!text) {
    return null;
  }

  // CJ can sometimes return a price range such as:
  // "4.25-7.50"
  const firstNumber = text.match(/-?\d+(?:\.\d+)?/);

  if (!firstNumber) {
    return null;
  }

  const number = Number(firstNumber[0]);

  return Number.isFinite(number) ? number : null;
}

function getProductName(product) {
  return (
    product?.nameEn ||
    product?.productNameEn ||
    product?.name ||
    product?.productName ||
    product?.productNameCn ||
    "Marlow Product"
  );
}

function getProductImage(product) {
  return (
    product?.bigImage ||
    product?.image ||
    product?.productImage ||
    product?.productImageUrl ||
    product?.picUrl ||
    product?.mainImage ||
    ""
  );
}

function getProductCost(product) {
  const possiblePrices = [
    product?.nowPrice,
    product?.sellPrice,
    product?.price,
    product?.productPrice,
  ];

  for (const value of possiblePrices) {
    const number = cleanNumber(value);

    if (number !== null && number > 0) {
      return number;
    }
  }

  return null;
}

function getProductId(product) {
  return (
    product?.id ||
    product?.pid ||
    product?.productId ||
    product?.productSku ||
    product?.sku ||
    null
  );
}

function calculateMarlowPrice(cost) {
  if (!Number.isFinite(cost) || cost <= 0) {
    return null;
  }

  let markup;

  if (cost < 10) {
    markup = 0.25;
  } else if (cost < 25) {
    markup = 0.22;
  } else if (cost < 50) {
    markup = 0.18;
  } else if (cost < 100) {
    markup = 0.15;
  } else if (cost < 200) {
    markup = 0.12;
  } else {
    markup = 0.10;
  }

  return Math.max(
    cost * (1 + markup),
    cost + 1
  );
}

function convertProduct(product) {
  const id = getProductId(product);
  const name = getProductName(product);
  const image = getProductImage(product);
  const cost = getProductCost(product);

  if (!id || !name || !image || cost === null) {
    return null;
  }

  const price = calculateMarlowPrice(cost);

  if (price === null) {
    return null;
  }

  return {
    id: String(id),
    name: String(name),
    title: String(name),
    image: String(image),
    bigImage: String(image),

    cost: Number(cost.toFixed(2)),
    price: Number(price.toFixed(2)),
    sellPrice: Number(price.toFixed(2)),

    supplier: "CJ",
    source: "CJ",

    productId: String(id),

    raw: product,
  };
}

function extractProducts(json) {
  const data = json?.data;

  if (!data) {
    return [];
  }

  // Current listV2 response:
  // data.content[].productList[]
  if (Array.isArray(data?.content)) {
    const result = [];

    for (const group of data.content) {
      if (Array.isArray(group?.productList)) {
        result.push(...group.productList);
      } else if (group && typeof group === "object") {
        // Some CJ responses can contain product objects directly.
        if (
          group.id ||
          group.pid ||
          group.productId ||
          group.nameEn ||
          group.productNameEn
        ) {
          result.push(group);
        }
      }
    }

    if (result.length) {
      return result;
    }
  }

  // Also support a direct product array.
  if (Array.isArray(data)) {
    return data;
  }

  // Also support data.productList.
  if (Array.isArray(data?.productList)) {
    return data.productList;
  }

  // Also support data.list.
  if (Array.isArray(data?.list)) {
    return data.list;
  }

  return [];
}

function getTotalRecords(json) {
  const data = json?.data;

  const values = [
    data?.totalRecords,
    data?.total,
    json?.totalRecords,
  ];

  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number) && number >= 0) {
      return number;
    }
  }

  return null;
}

function getTotalPages(json) {
  const data = json?.data;

  const values = [
    data?.totalPages,
    data?.pages,
  ];

  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number) && number >= 0) {
      return number;
    }
  }

  return null;
}

function isSuccessfulCJResponse(json) {
  if (!json) {
    return false;
  }

  if (json.code === 200) {
    return true;
  }

  if (json.success === true) {
    return true;
  }

  if (json.result === true) {
    return true;
  }

  return false;
}

async function fetchCJProducts({
  page,
  size,
  keyword,
  categoryId,
}) {
  const token = await getAccessToken();

  const url = new URL(CJ_PRODUCT_URL);

  url.searchParams.set(
    "page",
    String(Math.max(1, Math.min(MAX_PAGE, page)))
  );

  url.searchParams.set(
    "size",
    String(Math.max(1, Math.min(MAX_PAGE_SIZE, size)))
  );

  if (keyword) {
    url.searchParams.set("keyWord", keyword);
  }

  if (categoryId) {
    url.searchParams.set("categoryId", categoryId);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "CJ-Access-Token": token,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);

  // If the token has become invalid, clear it so the next request
  // can authenticate again.
  if (
    response.status === 401 ||
    response.status === 403 ||
    json?.code === 401 ||
    json?.code === 1600200
  ) {
    cachedAccessToken = null;
    tokenExpiresAt = 0;
  }

  if (!response.ok) {
    const message =
      json?.message ||
      json?.error ||
      `CJ product request failed with HTTP ${response.status}.`;

    const error = new Error(message);
    error.status = response.status;
    error.cjResponse = json;

    throw error;
  }

  if (!isSuccessfulCJResponse(json)) {
    const error = new Error(
      json?.message ||
        "CJ returned an unsuccessful product response."
    );

    error.status = 502;
    error.cjResponse = json;

    throw error;
  }

  const products = extractProducts(json);

  return {
    products,
    totalRecords: getTotalRecords(json),
    totalPages: getTotalPages(json),
    raw: json,
  };
}

function dedupeProducts(products) {
  const seen = new Set();
  const result = [];

  for (const product of products) {
    const id =
      product?.id ||
      product?.productId ||
      product?.pid ||
      product?.productSku ||
      product?.sku;

    const key = id
      ? String(id)
      : `${product?.nameEn || product?.productNameEn || ""}|${
          product?.bigImage || product?.image || ""
        }`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(product);
  }

  return result;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const requestedPage = Number(
      searchParams.get("page") || "1"
    );

    const requestedSize = Number(
      searchParams.get("size") || String(DEFAULT_PAGE_SIZE)
    );

    const keyword =
      searchParams.get("keyWord") ||
      searchParams.get("keyword") ||
      searchParams.get("search") ||
      "";

    const categoryId =
      searchParams.get("categoryId") ||
      "";

    const page = Number.isFinite(requestedPage)
      ? Math.max(1, Math.min(MAX_PAGE, Math.floor(requestedPage)))
      : 1;

    const size = Number.isFinite(requestedSize)
      ? Math.max(1, Math.min(MAX_PAGE_SIZE, Math.floor(requestedSize)))
      : DEFAULT_PAGE_SIZE;

    const result = await fetchCJProducts({
      page,
      size,
      keyword: String(keyword).trim(),
      categoryId: String(categoryId).trim(),
    });

    const uniqueRawProducts = dedupeProducts(
      result.products
    );

    const products = uniqueRawProducts
      .map(convertProduct)
      .filter(Boolean);

    const totalRecords = result.totalRecords;
    const totalPages = result.totalPages;

    let hasMore = true;

    if (
      Number.isFinite(totalPages) &&
      totalPages > 0
    ) {
      hasMore = page < totalPages;
    } else if (
      Number.isFinite(totalRecords) &&
      totalRecords >= 0
    ) {
      hasMore = page * size < totalRecords;
    } else {
      hasMore =
        uniqueRawProducts.length >= size;
    }

    // If CJ gave us fewer products than requested,
    // there is normally no additional page.
    if (uniqueRawProducts.length < size) {
      hasMore = false;
    }

    return NextResponse.json(
      {
        success: true,
        products,

        page,
        size,

        totalRecords,
        totalPages,

        hasMore,

        // Helpful metadata for the frontend.
        query: String(keyword).trim(),
        categoryId: String(categoryId).trim(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Marlow CJ API error:", error);

    const status =
      Number.isFinite(error?.status) &&
      error.status >= 400 &&
      error.status <= 599
        ? error.status
        : 500;

    let message =
      error?.message ||
      "We could not load products right now.";

    if (status === 429) {
      message =
        "CJ is temporarily rate limiting product requests. Please try again shortly.";
    }

    return NextResponse.json(
      {
        success: false,
        products: [],
        hasMore: false,
        error: message,
      },
      {
        status,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}
