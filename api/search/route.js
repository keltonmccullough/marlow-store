import { NextResponse } from "next/server";

const CJ_TOKEN_URL =
  "https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken";

const CJ_PRODUCT_URL =
  "https://developers.cjdropshipping.com/api2.0/v1/product/listV2";

const PAGE_SIZE = 100;

// Keep requests separated because CJ rate-limits API calls.
const CJ_REQUEST_GAP_MS = 1500;
const CJ_MAX_RETRIES = 5;

let cachedAccessToken = null;
let cachedTokenExpiresAt = 0;

let cjRequestQueue = Promise.resolve();
let lastCJRequestTime = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
  Put every CJ request through one queue.
  This prevents several browser requests from hitting CJ
  at the same time.
*/
function queueCJRequest(requestFunction) {
  const job = cjRequestQueue.then(async () => {
    const now = Date.now();

    const waitTime =
      CJ_REQUEST_GAP_MS -
      (now - lastCJRequestTime);

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

/*
  Get and cache the CJ access token.
*/
async function getCJAccessToken(forceRefresh = false) {
  const now = Date.now();

  if (
    !forceRefresh &&
    cachedAccessToken &&
    cachedTokenExpiresAt &&
    now < cachedTokenExpiresAt - 5 * 60 * 1000
  ) {
    return cachedAccessToken;
  }

  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "CJ_API_KEY is not configured in Vercel."
    );
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
    data = responseText
      ? JSON.parse(responseText)
      : {};
  } catch {
    data = {};
  }

  const cjCode =
    Number(data?.code ?? 0);

  const cjSuccess =
    data?.success !== false &&
    data?.result !== false &&
    cjCode !== 1600001 &&
    cjCode !== 1600005;

  if (!response.ok || !cjSuccess) {
    throw new Error(
      `CJ authentication failed (${response.status}): ${
        data?.message ||
        responseText ||
        "Unknown error"
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

  /*
    CJ currently documents long-lived access tokens.
    If an expiry is supplied, use it.
    Otherwise cache safely for 12 hours.
  */
  const expiryString =
    data?.data?.accessTokenExpiryDate ||
    data?.data?.access_token_expiry_date ||
    data?.data?.expiresAt ||
    data?.expiresAt;

  const parsedExpiry =
    expiryString
      ? new Date(expiryString).getTime()
      : 0;

  cachedTokenExpiresAt =
    parsedExpiry &&
    Number.isFinite(parsedExpiry)
      ? parsedExpiry
      : Date.now() +
        12 * 60 * 60 * 1000;

  return cachedAccessToken;
}

/*
  Product ID
*/
function getProductId(product) {
  return (
    product?.id ||
    product?.pid ||
    product?.productId ||
    product?.product_id ||
    null
  );
}

/*
  Product name
*/
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

/*
  Product image
*/
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

/*
  Product cost
*/
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

    if (
      Number.isFinite(number) &&
      number > 0
    ) {
      return number;
    }
  }

  return null;
}

/*
  Make sure the product has everything Marlow needs.
*/
function isUsableProduct(product) {
  const name =
    getProductName(product);

  const image =
    getProductImage(product);

  const cost =
    getProductCost(product);

  return Boolean(
    name &&
      image &&
      cost !== null
  );
}

/*
  CJ listV2 normally returns:

  data.content[].productList[]

  This function safely searches the response
  for actual product objects.
*/
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

    if (
      typeof value !== "object"
    ) {
      return;
    }

    /*
      Do not treat the response's outer
      data object as a product unless it
      actually contains product fields.
    */
    if (
      isUsableProduct(value)
    ) {
      products.push(value);
    }

    if (
      Array.isArray(value.content)
    ) {
      walk(value.content);
    }

    if (
      Array.isArray(value.productList)
    ) {
      walk(value.productList);
    }

    if (
      Array.isArray(value.products)
    ) {
      walk(value.products);
    }

    if (
      Array.isArray(value.list)
    ) {
      walk(value.list);
    }

    if (
      Array.isArray(value.data)
    ) {
      walk(value.data);
    }
  }

  walk(data);

  return products;
}

/*
  Remove duplicate products.
*/
function uniqueProducts(products) {
  const seen = new Set();
  const result = [];

  for (const product of products) {
    const id =
      getProductId(product);

    const name =
      getProductName(product)
        .trim()
        .toLowerCase();

    const image =
      getProductImage(product)
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

/*
  CJ can return rate-limit errors either
  through the HTTP status OR inside the JSON
  response code.
*/
function isRateLimited(
  status,
  data,
  text
) {
  const code =
    Number(data?.code ?? 0);

  if (
    status === 429 ||
    status === 402 ||
    status === 406
  ) {
    return true;
  }

  if (
    code === 429 ||
    code === 402 ||
    code === 406
  ) {
    return true;
  }

  const message =
    `${data?.message || ""} ${
      text || ""
    }`.toLowerCase();

  return (
    message.includes(
      "too many requests"
    ) ||
    message.includes(
      "rate limit"
    ) ||
    message.includes(
      "qps"
    ) ||
    message.includes(
      "request too frequent"
    )
  );
}

/*
  Detect an invalid/expired access token.
*/
function isInvalidToken(
  status,
  data
) {
  const code =
    Number(data?.code ?? 0);

  return (
    status === 401 ||
    code === 1600001 ||
    code === 1600002
  );
}

/*
  Ask CJ for products.
*/
async function fetchCJProducts({
  accessToken,
  page,
  size,
  query,
}) {
  let lastError = null;

  for (
    let attempt = 0;
    attempt <= CJ_MAX_RETRIES;
    attempt++
  ) {
    try {
      const response =
        await queueCJRequest(() => {
          const params =
            new URLSearchParams();

          params.set(
            "page",
            String(page)
          );

          params.set(
            "size",
            String(size)
          );

          if (query) {
            params.set(
              "keyWord",
              query
            );
          }

          return fetch(
            `${CJ_PRODUCT_URL}?${params.toString()}`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",
                "CJ-Access-Token":
                  accessToken,
              },
              cache: "no-store",
            }
          );
        });

      const responseText =
        await response.text();

      let data = {};

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : {};
      } catch {
        data = {};
      }

      /*
        CJ can return HTTP 200 while
        still reporting an API error code.
      */
      const cjCode =
        Number(
          data?.code ?? 0
        );

      const apiFailed =
        data?.result === false ||
        data?.success === false ||
        (
          cjCode !== 0 &&
          cjCode !== 200
        );

      /*
        Rate limit.
      */
      if (
        isRateLimited(
          response.status,
          data,
          responseText
        )
      ) {
        lastError =
          new Error(
            `CJ rate limit reached. Code: ${
              cjCode || response.status
            }`
          );

        if (
          attempt <
          CJ_MAX_RETRIES
        ) {
          /*
            Increasing wait times:
            2s, 4s, 6s, 8s, 10s
          */
          await sleep(
            2000 +
              attempt * 2000
          );

          continue;
        }

        throw lastError;
      }

      /*
        Invalid token.
      */
      if (
        isInvalidToken(
          response.status,
          data
        )
      ) {
        throw new Error(
          "CJ access token expired or is invalid."
        );
      }

      /*
        Other API errors.
      */
      if (
        !response.ok ||
        apiFailed
      ) {
        throw new Error(
          `CJ product request failed (${
            response.status
          }, code ${
            cjCode || "unknown"
          }): ${
            data?.message ||
            responseText ||
            "Unknown error"
          }`
        );
      }

      return data;
    } catch (error) {
      lastError = error;

      /*
        Do not repeatedly retry authentication
        or other permanent errors.
      */
      if (
        error?.message?.includes(
          "access token expired"
        ) ||
        error?.message?.includes(
          "authentication"
        )
      ) {
        throw error;
      }

      if (
        attempt <
        CJ_MAX_RETRIES
      ) {
        await sleep(
          2000 +
            attempt * 2000
        );

        continue;
      }

      throw error;
    }
  }

  throw (
    lastError ||
    new Error(
      "CJ product request failed."
    )
  );
}

/*
  GET /api/search
*/
export async function GET(
  request
) {
  try {
    const { searchParams } =
      new URL(
        request.url
      );

    const query =
      (
        searchParams.get("q") ||
        ""
      ).trim();

    let page =
      Number(
        searchParams.get(
          "page"
        ) || "1"
      );

    let size =
      Number(
        searchParams.get(
          "size"
        ) || PAGE_SIZE
      );

    if (
      !Number.isFinite(page) ||
      page < 1
    ) {
      page = 1;
    }

    if (
      !Number.isFinite(size) ||
      size < 1
    ) {
      size = PAGE_SIZE;
    }

    page =
      Math.floor(page);

    size = Math.min(
      Math.floor(size),
      PAGE_SIZE
    );

    /*
      CJ supports pages 1-1000
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

    /*
      Get the cached token.
    */
    let accessToken =
      await getCJAccessToken();

    let data;

    try {
      data =
        await fetchCJProducts({
          accessToken,
          page,
          size,
          query,
        });
    } catch (error) {
      /*
        If CJ says the token is invalid,
        get a fresh token once and retry.
      */
      if (
        error?.message?.includes(
          "access token expired"
        )
      ) {
        cachedAccessToken = null;
        cachedTokenExpiresAt = 0;

        accessToken =
          await getCJAccessToken(
            true
          );

        data =
          await fetchCJProducts({
            accessToken,
            page,
            size,
            query,
          });
      } else {
        throw error;
      }
    }

    const rawProducts =
      flattenProducts(data);

    const products =
      uniqueProducts(
        rawProducts
      );

    /*
      CJ's pagination information.
    */
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

      returnedProducts:
        products.length,

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
