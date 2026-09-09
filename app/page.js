"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const HOME_PRODUCT_LIMIT = 375;
const PAGE_SIZE = 100;
const HOME_CACHE_KEY = "marlow-home-products";
const HOME_CACHE_TIME_KEY = "marlow-home-products-time";
const HOME_CACHE_MAX_AGE = 0;

const CATEGORY_CACHE_KEY = "marlow-category-cache";
const CATEGORY_CACHE_MAX_AGE = 10 * 60 * 1000;

const CATEGORIES = [
  "All",
  "Electronics",
  "Phone & Accessories",
  "Women's Clothing",
  "Men's Clothing",
  "Shoes",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Home Improvement",
  "Sports & Fitness",
  "Travel",
  "Kids & Baby",
  "Toys & Games",
  "Jewelry & Accessories",
  "Bags & Luggage",
  "Automotive",
  "Pet Supplies",
  "Office & School",
  "Outdoor",
  "Gifts",
  "Deals",
];

const CATEGORY_SEARCHES = {
  All: "popular products new arrivals best sellers deals",
  Electronics: "electronics gadgets devices",
  "Phone & Accessories": "phone accessories chargers cables cases",
  "Women's Clothing": "women clothing fashion apparel dresses tops",
  "Men's Clothing": "men clothing fashion apparel shirts pants",
  Shoes: "shoes sneakers footwear sandals boots",
  "Beauty & Personal Care": "beauty skincare makeup personal care",
  "Home & Kitchen": "home kitchen decor household",
  "Home Improvement": "home improvement tools hardware storage",
  "Sports & Fitness": "sports fitness exercise gym outdoor",
  Travel: "travel luggage bags accessories",
  "Kids & Baby": "kids baby clothing toys nursery",
  "Toys & Games": "toys games kids puzzles",
  "Jewelry & Accessories": "jewelry accessories fashion",
  "Bags & Luggage": "bags backpacks luggage travel",
  Automotive: "automotive car accessories vehicle",
  "Pet Supplies": "pet supplies dog cat animal",
  "Office & School": "office school supplies stationery",
  Outdoor: "outdoor camping hiking garden",
  Gifts: "gifts gift ideas presents",
  Deals: "deals discounts sale clearance",
};
const CATEGORY_VARIANTS = {
  Electronics: [
    "electronics",
    "phone accessories",
    "computer accessories",
    "audio headphones",
    "smart devices",
    "chargers",
    "cables",
    "bluetooth",
    "gaming",
    "cameras",
    "watches",
    "power banks",
  ],

  Home: [
    "home",
    "home kitchen",
    "home decor",
    "kitchen organization",
    "household",
    "home accessories",
    "storage organization",
    "bathroom",
    "bedroom",
    "living room",
    "garden",
  ],

  Clothing: [
    "clothing",
    "apparel",
    "fashion",
    "women clothing",
    "women apparel",
    "men clothing",
    "men apparel",
    "shirts",
    "pants",
    "dresses",
    "skirts",
    "jackets",
    "hoodies",
    "shoes",
    "sneakers",
    "socks",
    "bags",
  ],

  Beauty: [
    "beauty",
    "skincare",
    "makeup",
    "hair care",
    "personal care",
    "cosmetics",
    "nail",
    "perfume",
    "hair accessories",
    "face care",
    "body care",
  ],

  Sports: [
    "fitness",
    "sports",
    "exercise",
    "outdoor sports",
    "gym accessories",
    "workout",
    "yoga",
    "running",
    "cycling",
    "camping",
    "hiking",
    "golf",
  ],

  Toys: [
    "toys",
    "kids toys",
    "children toys",
    "baby toys",
    "games",
    "educational toys",
    "puzzles",
    "dolls",
    "outdoor toys",
    "learning toys",
  ],

  Travel: [
    "travel",
    "luggage",
    "travel accessories",
    "suitcases",
    "travel bags",
    "backpacks",
    "organizers",
    "passport",
    "toiletry bags",
  ],

  Tools: [
    "tools",
    "hardware",
    "hand tools",
    "power tools",
    "home improvement",
    "repair tools",
    "workshop",
    "construction",
    "screwdriver",
    "wrench",
    "pliers",
    "drill",
  ],
};

/* =========================================================
   PRODUCT HELPERS
========================================================= */

function getSupplierName(product) {
  return (
    product?.productName ||
    product?.name ||
    product?.title ||
    product?.nameEn ||
    product?.productNameEn ||
    product?.product?.productName ||
    product?.product?.name ||
    product?.product?.title ||
    product?.product?.nameEn ||
    "Marlow Product"
  );
}

function getSupplierImage(product) {
  return (
    product?.productImage ||
    product?.bigImage ||
    product?.image ||
    product?.imageUrl ||
    product?.product?.productImage ||
    product?.product?.bigImage ||
    product?.product?.image ||
    product?.product?.imageUrl ||
    product?.skuImage ||
    product?.product?.skuImage ||
    ""
  );
}

function getSupplierCost(product) {
  const possiblePrices = [
    product?.sellPrice,
    product?.nowPrice,
    product?.price,
    product?.cost,
    product?.productPrice,
    product?.minPrice,
    product?.salePrice,
    product?.product?.sellPrice,
    product?.product?.nowPrice,
    product?.product?.price,
    product?.product?.cost,
    product?.product?.productPrice,
  ];

  for (const value of possiblePrices) {
    const number = Number(value);

    if (Number.isFinite(number) && number > 0) {
      return number;
    }
  }

  return 0;
}

function getCJProductId(product) {
  return (
    product?.pid ||
    product?.productId ||
    product?.id ||
    product?.product_id ||
    product?.product?.pid ||
    product?.product?.productId ||
    product?.product?.id ||
    null
  );
}

function getUniqueProductKey(product) {
  const cjId = getCJProductId(product);

  if (cjId) {
    return `cj-${String(cjId).trim()}`;
  }

  const name = String(getSupplierName(product) || "")
    .trim()
    .toLowerCase();

  const image = String(getSupplierImage(product) || "")
    .trim()
    .toLowerCase();

  return `fallback-${name}|${image}`;
}

function uniqueProducts(products) {
  const seen = new Set();
  const unique = [];

  for (const product of products || []) {
    if (!product) continue;

    const key = getUniqueProductKey(product);

    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(product);
  }

  return unique;
}

/* =========================================================
   MARLOW PRICING
========================================================= */

function calculateMarlowPrice(cost) {
  const amount = Number(cost) || 0;

  let markup = 0.25;

  if (amount >= 200) {
    markup = 0.10;
  } else if (amount >= 100) {
    markup = 0.12;
  } else if (amount >= 50) {
    markup = 0.15;
  } else if (amount >= 25) {
    markup = 0.18;
  } else if (amount >= 10) {
    markup = 0.22;
  }

  return Math.max(
    amount * (1 + markup),
    amount + 1
  );
}

/* =========================================================
   CATEGORY CLASSIFICATION
========================================================= */

function inferMarlowCategory(product) {
  const text = (
    getSupplierName(product) +
    " " +
    (product?.categoryName || "") +
    " " +
    (product?.category || "") +
    " " +
    (product?.categoryId || "") +
    " " +
    (product?.productType || "") +
    " " +
    (product?.product?.categoryName || "") +
    " " +
    (product?.product?.category || "")
  ).toLowerCase();

  if (
    /shirt|dress|pants|jeans|jacket|coat|hoodie|sweater|clothing|apparel|skirt|bra|lingerie|shoe|sneaker|sock|clothes|fashion|blouse|shorts|underwear|vest|cardigan|activewear/.test(
      text
    )
  ) {
    return "Clothing";
  }

  if (
    /makeup|cosmetic|beauty|skin|skincare|serum|lipstick|mascara|hair|shampoo|conditioner|nail|perfume|personal care|foundation|eyelash|eyebrow|moisturizer|cleanser|toner|brush set/.test(
      text
    )
  ) {
    return "Beauty";
  }

  if (
    /toy|toys|kids|kid|children|child|baby|game|puzzle|doll|lego|educational|learning toy|play/.test(
      text
    )
  ) {
    return "Toys";
  }

  if (
    /travel|luggage|suitcase|backpack|passport|travel bag|organizer|carry-on|carry on|duffel/.test(
      text
    )
  ) {
    return "Travel";
  }

  if (
    /tool|hardware|drill|screwdriver|wrench|pliers|saw|repair|workshop|construction|power tool|hand tool|socket|hammer/.test(
      text
    )
  ) {
    return "Tools";
  }

  if (
    /fitness|gym|sport|sports|exercise|yoga|running|cycling|camping|hiking|outdoor|workout|football|basketball|golf|baseball|soccer|swimming|training/.test(
      text
    )
  ) {
    return "Sports";
  }

  if (
    /phone|iphone|android|tablet|computer|laptop|keyboard|mouse|headphone|earbud|speaker|charger|cable|usb|camera|watch|electronic|bluetooth|power bank|gaming|monitor|microphone|projector|router|wifi|wireless|smart device|smartwatch/.test(
      text
    )
  ) {
    return "Electronics";
  }

  return "Home";
}

function convertSupplierProduct(product, index = 0) {
  const name = getSupplierName(product);
  const image = getSupplierImage(product);
  const cost = getSupplierCost(product);

  if (!name || !image || !cost) {
    return null;
  }

  const supplierId = getCJProductId(product);

  const id =
    supplierId ||
    `marlow-${index}-${String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;

  const category =
    product?.marlowCategory ||
    inferMarlowCategory(product);

  return {
    id: String(id),
    name: String(name),
    price: Number(
      calculateMarlowPrice(cost).toFixed(2)
    ),
    cost: Number(cost),
    image: String(image),
    category,
    description:
      product?.description ||
      product?.productDescEn ||
      product?.descriptionEn ||
      product?.product?.description ||
      product?.product?.productDescEn ||
      "Quality products selected for Marlow customers.",
    raw: product,
  };
}

function sortProducts(products) {
  return [...products].sort((a, b) => {
    const aName = String(a?.name || "").toLowerCase();
    const bName = String(b?.name || "").toLowerCase();

    return aName.localeCompare(bName);
  });
}

function matchesCategory(product, category) {
  return category === "All" || product?.category === category;
}

/* =========================================================
   SEARCH INTENT
========================================================= */

function normalizeSearchQuery(query) {
  const clean = query.trim().toLowerCase();

  const aliases = [
    {
      words: ["phone", "phones", "cell phone"],
      query: "phone accessories",
    },
    {
      words: ["cellphone accessories"],
      query: "phone accessories",
    },
    {
      words: ["earbuds", "ear buds"],
      query: "bluetooth earbuds headphones",
    },
    {
      words: ["laptop", "laptops"],
      query: "laptop computer accessories",
    },
    {
      words: ["women clothes", "womens clothes"],
      query: "women clothing apparel fashion",
    },
    {
      words: ["men clothes", "mens clothes"],
      query: "men clothing apparel fashion",
    },
    {
      words: ["kids", "children"],
      query: "kids toys children",
    },
    {
      words: ["makeup"],
      query: "beauty makeup cosmetics",
    },
    {
      words: ["cheap", "cheapest", "low price", "low priced"],
      query: clean.replace(
        /\b(cheap|cheapest|low price|low priced)\b/gi,
        ""
      ).trim() || "popular products",
    },
    {
      words: ["expensive", "highest price", "high price"],
      query: clean.replace(
        /\b(expensive|highest price|high price)\b/gi,
        ""
      ).trim() || "popular products",
    },
  ];

  for (const alias of aliases) {
    if (
      alias.words.some((word) =>
        clean.includes(word)
      )
    ) {
      return alias.query;
    }
  }

  return query.trim();
}

function getSearchSortMode(query) {
  const text = query.toLowerCase();

  if (
    /cheap|cheapest|lowest|low price|low priced/.test(
      text
    )
  ) {
    return "cheap";
  }

  if (
    /expensive|highest|high price|most expensive/.test(
      text
    )
  ) {
    return "expensive";
  }

  return "normal";
}

function sortSearchResults(products, originalQuery) {
  const mode = getSearchSortMode(originalQuery);

  if (mode === "cheap") {
    return [...products].sort(
      (a, b) =>
        Number(a.price) -
        Number(b.price)
    );
  }

  if (mode === "expensive") {
    return [...products].sort(
      (a, b) =>
        Number(b.price) -
        Number(a.price)
    );
  }

  return sortProducts(products);
}

/* =========================================================
   CJ API
   RATE-LIMIT PROTECTION
========================================================= */

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(
        new DOMException(
          "Request cancelled",
          "AbortError"
        )
      );
      return;
    }

    const timer = setTimeout(resolve, ms);

    const abortHandler = () => {
      clearTimeout(timer);
      reject(
        new DOMException(
          "Request cancelled",
          "AbortError"
        )
      );
    };

    signal?.addEventListener(
      "abort",
      abortHandler,
      { once: true }
    );
  });
}

async function fetchCJPage(
  query,
  page,
  signal
) {
  const params = new URLSearchParams();

  params.set("q", query);
  params.set("page", String(page));
  params.set("size", String(PAGE_SIZE));

  let lastError = null;

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(
        `/api/search?${params.toString()}`,
        {
          cache: "no-store",
          signal,
        }
      );

      if (response.ok) {
        const data =
          await response.json();

        if (
          !data ||
          typeof data !== "object"
        ) {
          throw new Error(
            "Invalid catalog response."
          );
        }

        if (
          data.success === false
        ) {
          throw new Error(
            data.error ||
              "The product catalog could not be loaded."
          );
        }

        return data;
      }

      const status = response.status;

      if (
        status === 429 ||
        status === 502 ||
        status === 503 ||
        status === 504
      ) {
        lastError = new Error(
          `Catalog temporarily busy: ${status}`
        );

        const delay =
          900 *
          Math.pow(2, attempt);

        await sleep(
          delay,
          signal
        );

        continue;
      }

      throw new Error(
        `Search request failed: ${status}`
      );
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        throw error;
      }

      lastError = error;

      if (
        attempt < 3
      ) {
        await sleep(
          900 *
            Math.pow(
              2,
              attempt
            ),
          signal
        );
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "Catalog request failed."
    )
  );
}

/* =========================================================
   GET ALL CJ PAGES
========================================================= */

async function fetchAllCJPages(
  query,
  signal,
  onBatch
) {
  let page = 1;
  let hasMore = true;

  const allProducts = [];
  const seen = new Set();

  while (
    hasMore &&
    page <= 1000
  ) {
    if (signal?.aborted) {
      throw new DOMException(
        "Request cancelled",
        "AbortError"
      );
    }

    const data =
      await fetchCJPage(
        query,
        page,
        signal
      );

    const batch =
      Array.isArray(
        data?.products
      )
        ? data.products
        : [];

    if (!batch.length) {
      break;
    }

    const newBatch = [];

    for (const product of batch) {
      const key =
        getUniqueProductKey(
          product
        );

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      allProducts.push(product);
      newBatch.push(product);
    }

    if (newBatch.length) {
      onBatch?.(newBatch);
    }

    hasMore =
      Boolean(data?.hasMore);

    if (
      !hasMore &&
      data?.totalPages &&
      page <
        Number(
          data.totalPages
        )
    ) {
      hasMore = true;
    }

    if (
      newBatch.length === 0
    ) {
      break;
    }

    page += 1;

    if (hasMore) {
      await sleep(
        250,
        signal
      );
    }
  }

  return allProducts;
}

/* =========================================================
   HOMEPAGE LOADER
========================================================= */

async function loadHomepageProducts(
  queries,
  target,
  signal,
  onProducts
) {
  const collected = [];
  const seen = new Set();

  for (const query of queries) {
    if (
      collected.length >=
      target
    ) {
      break;
    }

    let page = 1;
    let hasMore = true;

    while (
      hasMore &&
      collected.length <
        target &&
      page <= 1000
    ) {
      if (
        signal?.aborted
      ) {
        throw new DOMException(
          "Request cancelled",
          "AbortError"
        );
      }

      const data =
        await fetchCJPage(
          query,
          page,
          signal
        );

      const batch =
        Array.isArray(
          data?.products
        )
          ? data.products
          : [];

      if (!batch.length) {
        break;
      }

      for (const product of batch) {
        const key =
          getUniqueProductKey(
            product
          );

        if (
          seen.has(key)
        ) {
          continue;
        }

        const converted =
          convertSupplierProduct(
            product,
            collected.length
          );

        if (!converted) {
          continue;
        }

        seen.add(key);
        collected.push(product);

        const current =
          collected
            .map(
              (
                item,
                index
              ) =>
                convertSupplierProduct(
                  item,
                  index
                )
            )
            .filter(Boolean);

        const unique =
          uniqueProducts(
            current
          );

onProducts(
  unique.slice(
    0,
    target
  )
);
        if (
          unique.length >=
          target
        ) {
          break;
        }
      }

      if (
        collected
          .map(
            (
              item,
              index
            ) =>
              convertSupplierProduct(
                item,
                index
              )
          )
          .filter(Boolean)
          .length >=
        target
      ) {
        break;
      }

      hasMore =
        Boolean(data?.hasMore);

      if (
        !hasMore &&
        data?.totalPages &&
        page <
          Number(
            data.totalPages
          )
      ) {
        hasMore = true;
      }

      page += 1;

      if (hasMore) {
        await sleep(
          250,
          signal
        );
      }
    }
  }

return shuffleProducts(
  uniqueProducts(
    collected
      .map(
        (product, index) =>
          convertSupplierProduct(
            product,
            index
          )
      )
      .filter(Boolean)
  ).slice(
    0,
    target
  )
);
/* =========================================================
   CATEGORY CACHE
========================================================= */

function getCategoryCache() {
  try {
    const raw =
      sessionStorage.getItem(
        CATEGORY_CACHE_KEY
      );

    if (!raw) {
      return {};
    }

    const parsed =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error(
      "Category cache read error:",
      error
    );

    return {};
  }
}

function getCachedCategoryProducts(
  category
) {
  const cache =
    getCategoryCache();

  const entry =
    cache?.[category];

  if (
    !entry ||
    !Array.isArray(
      entry.products
    ) ||
    !entry.createdAt
  ) {
    return null;
  }

  if (
    Date.now() -
      Number(
        entry.createdAt
      ) >
    CATEGORY_CACHE_MAX_AGE
  ) {
    return null;
  }

  return entry.products;
}

function saveCachedCategoryProducts(
  category,
  products
) {
  try {
    const cache =
      getCategoryCache();

    cache[category] = {
      createdAt: Date.now(),
      products:
        uniqueProducts(
          products
        ),
    };

    sessionStorage.setItem(
      CATEGORY_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error(
      "Category cache save error:",
      error
    );
  }
}

/* =========================================================
   CATEGORY LOADER
   RESTORED ORIGINAL SEARCH BEHAVIOR
========================================================= */

async function fetchCategoryProducts(
  category,
  signal,
  onProducts
) {
  const queries =
    CATEGORY_VARIANTS[
      category
    ] || [
      CATEGORY_SEARCHES[
        category
      ],
    ];

  let products = [];

  const cached =
    getCachedCategoryProducts(
      category
    );

  if (
    cached &&
    cached.length
  ) {
    products =
      uniqueProducts(
        cached
      );

    const categorizedCached =
      products.filter(
        (product) =>
          matchesCategory(
            product,
            category
          )
      );

    if (
      categorizedCached.length
    ) {
      onProducts(
        sortProducts(
          categorizedCached
        )
      );
    }
  }

  for (const query of queries) {
    if (
      signal?.aborted
    ) {
      throw new DOMException(
        "Request cancelled",
        "AbortError"
      );
    }

    try {
      await fetchAllCJPages(
        query,
        signal,
        (batch) => {
          if (
            signal?.aborted
          ) {
            throw new DOMException(
              "Request cancelled",
              "AbortError"
            );
          }

          const converted =
            batch
              .map(
                (
                  product,
                  index
                ) =>
                  convertSupplierProduct(
                    product,
                    products.length +
                      index
                  )
              )
              .filter(Boolean);

          products =
            uniqueProducts([
              ...products,
              ...converted,
            ]);

          const categorized =
            products.filter(
              (product) =>
                matchesCategory(
                  product,
                  category
                )
            );

          const sorted =
            sortProducts(
              categorized
            );

          if (
            sorted.length
          ) {
            onProducts(
              sorted
            );
          }
        }
      );
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        throw error;
      }

      console.error(
        `Category query failed: ${query}`,
        error
      );
    }
  }

  const categorized =
    products.filter(
      (product) =>
        matchesCategory(
          product,
          category
        )
    );

  const finalProducts =
    sortProducts(
      uniqueProducts(
        categorized
      )
    );

  if (
    finalProducts.length
  ) {
    saveCachedCategoryProducts(
      category,
      finalProducts
    );
  }

  return finalProducts;
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  onOpen,
  onAdd,
}) {
  return (
    <article className="product-card">
      <button
        className="product-image-button"
        onClick={() =>
          onOpen(product)
        }
        aria-label={`View ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </button>

      <div className="product-info">
        <div className="product-category">
          {product.category}
        </div>

        <button
          className="product-name"
          onClick={() =>
            onOpen(product)
          }
        >
          {product.name}
        </button>

        <div className="product-bottom">
          <strong className="product-price">
            $
            {Number(
              product.price
            ).toFixed(2)}
          </strong>

          <button
            className="add-button"
            onClick={() =>
              onAdd(product)
            }
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PRODUCT GRID
========================================================= */

function ProductGrid({
  products,
  onOpen,
  onAdd,
}) {
  if (!products.length) {
    return (
      <div className="empty-products">
        <h3>
          No products available
        </h3>

        <p>
          Try another category
          or search for
          something else.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map(
        (product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpen={onOpen}
            onAdd={onAdd}
          />
        )
      )}
    </div>
  );
}

/* =========================================================
   PRODUCT MODAL
========================================================= */

function ProductModal({
  product,
  onClose,
  onAdd,
}) {
  if (!product) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="product-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="modal-image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="modal-image"
          />
        </div>

        <div className="modal-details">
          <span className="modal-category">
            {product.category}
          </span>

          <h2>
            {product.name}
          </h2>

          <div className="modal-price">
            $
            {Number(
              product.price
            ).toFixed(2)}
          </div>

          <p>
            {product.description}
          </p>

          <button
            className="modal-add-button"
            onClick={() => {
              onAdd(product);
              onClose();
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ACCOUNT MODAL
========================================================= */

function AccountModal({
  account,
  onClose,
  onCreateAccount,
  onSignOut,
}) {
  const [mode, setMode] =
    useState("signin");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [accountError, setAccountError] =
    useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setAccountError("");

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setAccountError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setAccountError(
        "Please enter your password."
      );
      return;
    }

    if (
      mode === "create" &&
      !cleanName
    ) {
      setAccountError(
        "Please enter your name."
      );
      return;
    }

    if (
      mode === "create"
    ) {
      onCreateAccount({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      setPassword("");
      return;
    }

    onCreateAccount({
      name: "",
      email: cleanEmail,
      password,
      signingIn: true,
    });
  }

  return (
    <div
      className="account-backdrop"
      onClick={onClose}
    >
      <div
        className="account-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {account ? (
          <>
            <span className="eyebrow">
              My Marlow
            </span>

            <h2>
              Welcome back,
              <br />
              {account.name}
            </h2>

            <div className="account-info">
              <strong>
                Account email
              </strong>

              <span>
                {account.email}
              </span>
            </div>

            <p className="account-note">
              Your Marlow account is
              available whenever you
              return to this browser.
            </p>

            <button
              className="modal-add-button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <span className="eyebrow">
              Marlow Account
            </span>

            <h2>
              {mode === "create"
                ? "Create your account"
                : "Sign in to Marlow"}
            </h2>

            <p className="account-note">
              Create an account so
              you can return to
              Marlow and access
              your account anytime.
            </p>

            <form
              className="account-form"
              onSubmit={handleSubmit}
            >
              {mode ===
                "create" && (
                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Full name"
                  autoComplete="name"
                />
              )}

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Email address"
                autoComplete="email"
              />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Password"
                autoComplete={
                  mode === "create"
                    ? "new-password"
                    : "current-password"
                }
              />

              {accountError && (
                <div className="account-error">
                  {accountError}
                </div>
              )}

              <button
                type="submit"
                className="modal-add-button"
              >
                {mode === "create"
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>

            <button
              className="account-switch"
              onClick={() => {
                setAccountError("");

                setMode(
                  mode === "create"
                    ? "signin"
                    : "create"
                );
              }}
            >
              {mode === "create"
                ? "Already have an account? Sign in"
                : "Need an account? Create one"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CART DRAWER
========================================================= */

function CartDrawer({
  cart,
  onClose,
  onRemove,
  onCheckout,
}) {
  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );

  return (
    <div
      className="cart-backdrop"
      onClick={onClose}
    >
      <aside
        className="cart-drawer"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="cart-header">
          <h2>
            Your Cart
          </h2>

          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {!cart.length ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              🛒
            </div>

            <h3>
              Your cart is empty
            </h3>

            <p>
              Add something you
              love from Marlow.
            </p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(
                (item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="cart-item-info">
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        $
                        {Number(
                          item.price
                        ).toFixed(2)}
                      </span>

                      <span>
                        Quantity:{" "}
                        {item.quantity}
                      </span>

                      <button
                        className="remove-button"
                        onClick={() =>
                          onRemove(
                            item.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="cart-summary">
              <div className="subtotal-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  $
                  {subtotal.toFixed(
                    2
                  )}
                </strong>
              </div>

              <p className="checkout-note">
                Tax and shipping
                will be calculated
                during secure
                checkout.
              </p>

              <button
                className="checkout-button"
                onClick={
                  onCheckout
                }
              >
                Continue to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* =========================================================
   MARLOW ASSISTANT
========================================================= */

function MarlowAssistant({
  onSearch,
  onCategory,
  onClose,
}) {
  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        from: "assistant",
        text:
          "Hi! I'm the Marlow Assistant. Tell me what you're looking for and I'll help you find it.",
      },
    ]);

  function handleSubmit(event) {
    event.preventDefault();

    const clean =
      message.trim();

    if (!clean) return;

    setMessages((current) => [
      ...current,
      {
        from: "user",
        text: clean,
      },
    ]);

    const lower =
      clean.toLowerCase();

    let response =
      "I'll search Marlow for that.";

    const categoryMap = [
      [
        "electronics",
        "Electronics",
      ],
      ["phone", "Electronics"],
      ["computer", "Electronics"],
      ["laptop", "Electronics"],
      ["home", "Home"],
      ["kitchen", "Home"],
      ["clothing", "Clothing"],
      ["clothes", "Clothing"],
      ["shoes", "Clothing"],
      ["beauty", "Beauty"],
      ["makeup", "Beauty"],
      ["skincare", "Beauty"],
      ["sports", "Sports"],
      ["fitness", "Sports"],
      ["gym", "Sports"],
      ["toy", "Toys"],
      ["kids", "Toys"],
      ["travel", "Travel"],
      ["luggage", "Travel"],
      ["tools", "Tools"],
    ];

    const matched =
      categoryMap.find(
        ([word]) =>
          lower.includes(word)
      );

    if (matched) {
      response = `I'll show you Marlow products related to ${matched[1].toLowerCase()}.`;

      onCategory(
        matched[1]
      );
    } else {
      response =
        "I'll search the Marlow catalog for products matching that.";

      onSearch(clean);
    }

    setMessages((current) => [
      ...current,
      {
        from: "assistant",
        text: response,
      },
    ]);

    setMessage("");
  }

  return (
    <div className="assistant-panel">
      <div className="assistant-header">
        <div>
          <strong>
            Marlow Assistant
          </strong>

          <span>
            Product help
          </span>
        </div>

        <button
          className="assistant-close"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="assistant-messages">
        {messages.map(
          (item, index) => (
            <div
              key={index}
              className={
                item.from ===
                "user"
                  ? "assistant-message user-message"
                  : "assistant-message"
              }
            >
              {item.text}
            </div>
          )
        )}
      </div>

      <div className="assistant-suggestions">
        <button
          onClick={() =>
            onSearch(
              "cheap electronics"
            )
          }
        >
          Cheap electronics
        </button>

        <button
          onClick={() =>
            onSearch(
              "phone accessories"
            )
          }
        >
          Phone accessories
        </button>

        <button
          onClick={() =>
            onSearch(
              "women clothing"
            )
          }
        >
          Women's clothing
        </button>
      </div>

      <form
        className="assistant-form"
        onSubmit={handleSubmit}
      >
        <input
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
          placeholder="What are you looking for?"
        />

        <button type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const router = useRouter();
  const [search, setSearch] =
    useState("");

  const [
    submittedSearch,
    setSubmittedSearch,
  ] = useState("");

  const [category, setCategory] =
    useState("All");

  const [homeProducts, setHomeProducts] =
    useState([]);

  const [
    categoryProducts,
    setCategoryProducts,
  ] = useState([]);

  const [loadingHome, setLoadingHome] =
    useState(true);

  const [
    loadingCategory,
    setLoadingCategory,
  ] = useState(false);

  const [
    searchProducts,
    setSearchProducts,
  ] = useState([]);

  const [searching, setSearching] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  const [cart, setCart] =
    useState([]);

  const [cartOpen, setCartOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  const [account, setAccount] =
    useState(null);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [
    assistantOpen,
    setAssistantOpen,
  ] = useState(false);

  const homeController =
    useRef(null);

  const categoryController =
    useRef(null);

  const searchController =
    useRef(null);

  /* =======================================================
     CANCEL OTHER CATALOG REQUESTS
  ======================================================= */

  function cancelCatalogRequests() {
    homeController.current?.abort();
    categoryController.current?.abort();
    searchController.current?.abort();

    homeController.current = null;
    categoryController.current = null;
    searchController.current = null;
  }

  /* =======================================================
     LOAD CART + ACCOUNT
  ======================================================= */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          "marlow-cart"
        );

      if (savedCart) {
        const parsed =
          JSON.parse(
            savedCart
          );

        if (
          Array.isArray(
            parsed
          )
        ) {
          setCart(parsed);
        }
      }

      const savedAccount =
        localStorage.getItem(
          "marlow-account"
        );

      if (savedAccount) {
        const parsed =
          JSON.parse(
            savedAccount
          );

        if (
          parsed &&
          parsed.email &&
          parsed.name
        ) {
          setAccount(parsed);
        }
      }
    } catch (storageError) {
      console.error(
        "Marlow storage error:",
        storageError
      );
    }
  }, []);

  /* =======================================================
     SAVE CART
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "marlow-cart",
        JSON.stringify(
          cart
        )
      );
    } catch (storageError) {
      console.error(
        "Could not save cart:",
        storageError
      );
    }
  }, [cart]);

  /* =======================================================
     HOMEPAGE
======================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    homeController.current =
      controller;

    let cancelled = false;

    async function loadHome() {
      setError("");

      try {
        const cached =
          sessionStorage.getItem(
            HOME_CACHE_KEY
          );

        const cachedTime =
          Number(
            sessionStorage.getItem(
              HOME_CACHE_TIME_KEY
            ) || "0"
          );

        if (
          cached &&
          cachedTime &&
          Date.now() -
            cachedTime <
            HOME_CACHE_MAX_AGE
        ) {
          const parsed =
            JSON.parse(
              cached
            );

          if (
            Array.isArray(
              parsed
            ) &&
            parsed.length
          ) {
            setHomeProducts(
              parsed.slice(
                0,
                HOME_PRODUCT_LIMIT
              )
            );

            setLoadingHome(
              false
            );
          }
        }
      } catch (cacheError) {
        console.error(
          "Homepage cache error:",
          cacheError
        );
      }

      const queries = [
        "popular products",
        "electronics",
        "phone accessories",
        "home kitchen",
        "home decor",
        "clothing",
        "shoes",
        "beauty skincare",
        "fitness sports",
        "toys kids",
        "travel luggage",
        "tools",
      ];

      try {
        const finalProducts =
          await loadHomepageProducts(
            queries,
            HOME_PRODUCT_LIMIT,
            controller.signal,
            (products) => {
              if (
                cancelled ||
                controller.signal.aborted
              ) {
                return;
              }

              if (
                products.length
              ) {
                setHomeProducts(
                  products
                );

                setLoadingHome(
                  false
                );

                try {
                  sessionStorage.setItem(
                    HOME_CACHE_KEY,
                    JSON.stringify(
                      products
                    )
                  );

                  sessionStorage.setItem(
                    HOME_CACHE_TIME_KEY,
                    String(
                      Date.now()
                    )
                  );
                } catch (cacheError) {
                  console.error(
                    "Homepage cache save error:",
                    cacheError
                  );
                }
              }
            }
          );

        if (
          !cancelled &&
          !controller.signal.aborted &&
          !finalProducts.length &&
          homeProducts.length === 0
        ) {
          setError(
            "We couldn't load the live product catalog right now."
          );

          setLoadingHome(
            false
          );
        }
      } catch (err) {
        if (
          err?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Homepage catalog error:",
          err
        );

        if (
          !cancelled
        ) {
          setError(
            "We couldn't load the live product catalog right now."
          );

          setLoadingHome(
            false
          );
        }
      }
    }

    loadHome();

    return () => {
      cancelled = true;
      controller.abort();

      if (
        homeController.current ===
        controller
      ) {
        homeController.current =
          null;
      }
    };
  }, []);

  /* =======================================================
     CATEGORY
======================================================= */

  useEffect(() => {
    if (
      category === "All"
    ) {
      setCategoryProducts([]);
      setLoadingCategory(false);
      return;
    }

    const controller =
      new AbortController();

    categoryController.current =
      controller;

    let cancelled = false;

    const cached =
      getCachedCategoryProducts(
        category
      );

    setError("");

    if (
      cached &&
      cached.length
    ) {
      setCategoryProducts(
        uniqueProducts(
          cached
        )
      );

      setLoadingCategory(
        false
      );
    } else {
      setCategoryProducts([]);
      setLoadingCategory(true);
    }

    async function loadCategory() {
      try {
        const products =
          await fetchCategoryProducts(
            category,
            controller.signal,
            (productsSoFar) => {
              if (
                cancelled ||
                controller.signal.aborted
              ) {
                return;
              }

              const unique =
                uniqueProducts(
                  productsSoFar
                );

              if (
                unique.length
              ) {
                setCategoryProducts(
                  unique
                );

                /*
                 * IMPORTANT:
                 * Keep loading true until
                 * actual category products
                 * have appeared.
                 *
                 * This prevents "No products
                 * available" from appearing
                 * while the remaining category
                 * searches are still running.
                 */
                setLoadingCategory(
                  false
                );
              }
            }
          );

        if (
          !cancelled &&
          !controller.signal.aborted
        ) {
          const finalProducts =
            uniqueProducts(
              products
            );

          setCategoryProducts(
            finalProducts
          );

          setLoadingCategory(
            false
          );
        }
      } catch (err) {
        if (
          err?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Category error:",
          err
        );

        if (
          !cancelled
        ) {
          /*
           * Only show a true category
           * error when the category did
           * not already give us cached or
           * loaded products.
           */
          setCategoryProducts(
            (current) =>
              current
          );

          setError(
            "We couldn't load this category right now."
          );

          setLoadingCategory(
            false
          );
        }
      }
    }

    loadCategory();

    return () => {
      cancelled = true;
      controller.abort();

      if (
        categoryController.current ===
        controller
      ) {
        categoryController.current =
          null;
      }
    };
  }, [category]);

  /* =======================================================
     SEARCH
======================================================= */

  async function performSearch(
    query
  ) {
    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      return;
    }

    cancelCatalogRequests();

    const controller =
      new AbortController();

    searchController.current =
      controller;

    setSearching(true);
    setSubmittedSearch(
      cleanQuery
    );
    setCategory("All");
    setSearchProducts([]);
    setError("");

    const actualQuery =
      normalizeSearchQuery(
        cleanQuery
      );

    try {
      let results = [];

      await fetchAllCJPages(
        actualQuery,
        controller.signal,
        (batch) => {
          const converted =
            batch
              .map(
                (
                  product,
                  index
                ) =>
                  convertSupplierProduct(
                    product,
                    index
                  )
              )
              .filter(Boolean);

          results =
            uniqueProducts([
              ...results,
              ...converted,
            ]);

          setSearchProducts(
            sortSearchResults(
              results,
              cleanQuery
            )
          );
        }
      );

      if (
        !controller.signal.aborted
      ) {
        const final =
          uniqueProducts(
            results
          );

        setSearchProducts(
          sortSearchResults(
            final,
            cleanQuery
          )
        );
      }
    } catch (err) {
      if (
        err?.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "Search error:",
        err
      );

      setSearchProducts([]);

      setError(
        "We couldn't complete that search right now."
      );
    } finally {
      if (
        searchController.current ===
        controller
      ) {
        searchController.current =
          null;
      }

      if (
        !controller.signal.aborted
      ) {
        setSearching(
          false
        );
      }
    }
  }

  /* =======================================================
     CATEGORY CLICK
======================================================= */

  function selectCategory(
    item
  ) {
    cancelCatalogRequests();

    setSubmittedSearch("");
    setSearch("");
    setSearchProducts([]);
    setError("");

    if (
      item === "All"
    ) {
      setCategoryProducts([]);
    }

    setCategory(item);
  }

  /* =======================================================
     ACCOUNT
======================================================= */

  function handleAccountSubmit(
    data
  ) {
    const email =
      String(
        data?.email || ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        data?.password || ""
      );

    if (
      !email ||
      !password
    ) {
      return;
    }

    if (data.signingIn) {
      try {
        const stored =
          localStorage.getItem(
            "marlow-account"
          );

        if (!stored) {
          alert(
            "No Marlow account was found on this browser. Please create an account first."
          );

          return;
        }

        const saved =
          JSON.parse(
            stored
          );

        if (
          saved.email !==
            email ||
          saved.password !==
            password
        ) {
          alert(
            "The email or password is incorrect."
          );

          return;
        }

        setAccount(saved);
        return;
      } catch (accountError) {
        console.error(
          "Sign-in error:",
          accountError
        );

        alert(
          "We couldn't sign you in right now."
        );

        return;
      }
    }

    const name =
      String(
        data?.name || ""
      ).trim();

    if (!name) {
      alert(
        "Please enter your name."
      );

      return;
    }

    const newAccount = {
      name,
      email,
      password,
      createdAt:
        new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "marlow-account",
        JSON.stringify(
          newAccount
        )
      );

      setAccount(
        newAccount
      );

      alert(
        "Your Marlow account has been created."
      );
    } catch (accountError) {
      console.error(
        "Account creation error:",
        accountError
      );

      alert(
        "We couldn't create your account right now."
      );
    }
  }

  function signOutAccount() {
    setAccount(null);
  }

  /* =======================================================
     CART
======================================================= */

  function addToCart(
    product
  ) {
    setCart(
      (current) => {
        const existing =
          current.find(
            (item) =>
              item.id ===
              product.id
          );

        if (existing) {
          return current.map(
            (item) =>
              item.id ===
              product.id
                ? {
                    ...item,
                    quantity:
                      item.quantity +
                      1,
                  }
                : item
          );
        }

        return [
          ...current,
          {
            ...product,
            quantity: 1,
          },
        ];
      }
    );

    setCartOpen(true);
  }

  function removeFromCart(
    id
  ) {
    setCart(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  function handleCheckout() {
    if (!account) {
      setCartOpen(false);
      setAccountOpen(true);

      alert(
        "Please create a Marlow account or sign in before continuing to checkout."
      );

      return;
    }

    alert(
      "Secure checkout is not connected yet. Customer accounts, tax, shipping, payment processing, and CJ order fulfillment still need to be connected before real orders can be accepted."
    );
  }

  /* =======================================================
     DISPLAYED PRODUCTS
======================================================= */

  const displayedProducts =
    useMemo(() => {
      if (
        submittedSearch
      ) {
        return searchProducts;
      }

      if (
        category !== "All"
      ) {
        return categoryProducts;
      }

      return homeProducts.slice(
        0,
        HOME_PRODUCT_LIMIT
      );
    }, [
      submittedSearch,
      searchProducts,
      category,
      categoryProducts,
      homeProducts,
    ]);

  const cartCount =
    cart.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

  const showLoading =
    searching ||
    (
      loadingCategory &&
      displayedProducts.length ===
        0
    ) ||
    (
      loadingHome &&
      displayedProducts.length ===
        0
    );

  /* =======================================================
     RENDER
======================================================= */

  return (
    <main className="site">
      <header className="header">
        <div className="header-inner">
          <button
            className="logo"
            onClick={() => {
              cancelCatalogRequests();

              setCategory("All");
              setSubmittedSearch("");
              setSearch("");
              setSearchProducts([]);
              setCategoryProducts([]);
              setError("");
            }}
          >
            Marlow
          </button>

          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault();
              performSearch(search);
            }}
          >
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products..."
              aria-label="Search products"
            />

            <button type="submit">
              Search
            </button>
          </form>

          <div className="header-actions">
            <button
              onClick={() =>
                setAccountOpen(true)
              }
            >
              {account
                ? "My Account"
                : "Account"}
            </button>

            <button
              onClick={() => {
                if (!account) {
                  setAccountOpen(true);
                  return;
                }

                alert(
                  "Your order history will appear here once secure checkout and order processing are connected."
                );
              }}
            >
              Orders
            </button>

            <button
              className="cart-button"
              onClick={() =>
                setCartOpen(true)
              }
            >
              Cart

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <nav className="category-bar">
        <div className="category-inner">
          {CATEGORIES.map(
            (item) => (
              <button
                key={item}
                className={
                  category === item &&
                  !submittedSearch
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() =>
                  selectCategory(item)
                }
              >
                {item}
              </button>
            )
          )}
        </div>
      </nav>

      {!submittedSearch &&
        category === "All" && (
          <section className="hero">
            <div className="hero-content">
              <span className="hero-eyebrow">
                Welcome to Marlow
              </span>

              <h1>
                Discover products
                you'll love.
              </h1>

              <p>
                Shop a growing
                collection of
                products across
                electronics,
                home, clothing,
                beauty, sports,
                travel and more.
              </p>

              <button
                className="hero-button"
                onClick={() => {
                  document
                    .getElementById(
                      "products"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }}
              >
                Shop Marlow
              </button>
            </div>
          </section>
        )}

      <section
        className="products-section"
        id="products"
      >
        <div className="section-heading">
          <div>
            {submittedSearch ? (
              <>
                <span className="eyebrow">
                  Search Results
                </span>

                <h2>
                  Results for "
                  {submittedSearch}"
                </h2>
              </>
            ) : category !== "All" ? (
              <>
                <span className="eyebrow">
                  Marlow Category
                </span>

                <h2>
                  {category}
                </h2>
              </>
            ) : (
              <>
                <span className="eyebrow">
                  Marlow Collection
                </span>

                <h2>
                  Featured Products
                </h2>
              </>
            )}
          </div>

          {submittedSearch &&
            !searching && (
              <div className="product-count">
                {displayedProducts.length}{" "}
                results
              </div>
            )}

          {!submittedSearch &&
            category !== "All" &&
            !loadingCategory &&
            displayedProducts.length >
              0 && (
              <div className="product-count">
                {displayedProducts.length}{" "}
                products
              </div>
            )}
        </div>

        {error && (
          <div className="notice">
            {error}
          </div>
        )}

        {showLoading &&
        displayedProducts.length ===
          0 ? (
          <div className="loading">
            <div className="spinner" />

            <p>
              {searching
                ? "Searching the Marlow catalog..."
                : "Loading products..."}
            </p>
          </div>
        ) : (
          <ProductGrid
            products={
              displayedProducts
            }
onOpen={(product) => {
  try {
    sessionStorage.setItem(
      "marlow-selected-product",
      JSON.stringify(product)
    );
  } catch (storageError) {
    console.error(
      "Could not save selected product:",
      storageError
    );
  }

  router.push(
    `/product/${encodeURIComponent(
      product.id
    )}`
  );
}}
          />
        )}
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">
              Marlow
            </div>

            <p>
              A better way to
              discover products
              online.
            </p>
          </div>

          <div>
            <h4>
              Shop
            </h4>

            {CATEGORIES.slice(
              1
            ).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => {
                    selectCategory(
                      item
                    );

                    window.scrollTo({
                      top: 0,
                      behavior:
                        "smooth",
                    });
                  }}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        <div className="footer-bottom">
          ©{" "}
          {new Date().getFullYear()}{" "}
          Marlow. All rights
          reserved.
        </div>
      </footer>

      <button
        className="assistant-launcher"
        onClick={() =>
          setAssistantOpen(
            (open) => !open
          )
        }
        aria-label="Open Marlow Assistant"
      >
        <span className="assistant-icon">
          ✦
        </span>

        <span>
          Marlow Assistant
        </span>
      </button>

      {assistantOpen && (
        <MarlowAssistant
          onSearch={(query) => {
            setAssistantOpen(false);
            setSearch(query);
            performSearch(query);
          }}
          onCategory={(item) => {
            setAssistantOpen(false);
            selectCategory(item);
          }}
          onClose={() =>
            setAssistantOpen(false)
          }
        />
      )}

      <ProductModal
        product={
          selectedProduct
        }
        onClose={() =>
          setSelectedProduct(
            null
          )
        }
        onAdd={
          addToCart
        }
      />

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() =>
            setCartOpen(false)
          }
          onRemove={
            removeFromCart
          }
          onCheckout={
            handleCheckout
          }
        />
      )}

      {accountOpen && (
        <AccountModal
          account={account}
          onClose={() =>
            setAccountOpen(false)
          }
          onCreateAccount={
            handleAccountSubmit
          }
          onSignOut={
            signOutAccount
          }
        />
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f7f7f5;
          color: #181818;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .site {
          min-height: 100vh;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(
            255,
            255,
            255,
            0.96
          );
          border-bottom: 1px solid #e5e5e5;
          backdrop-filter: blur(12px);
        }

        .header-inner {
          max-width: 1500px;
          margin: 0 auto;
          min-height: 76px;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .logo {
          border: 0;
          background: transparent;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -1.5px;
          color: #111;
        }

        .search-form {
          flex: 1;
          max-width: 700px;
          display: flex;
          background: #f2f2f2;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid #dedede;
        }

        .search-form input {
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          padding: 14px 18px;
          min-width: 0;
        }

        .search-form button {
          border: 0;
          background: #111;
          color: #fff;
          padding: 0 22px;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-actions > button {
          border: 0;
          background: transparent;
          padding: 10px 8px;
          font-weight: 600;
          color: #222;
        }

        .cart-button {
          position: relative;
        }

        .cart-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          margin-left: 5px;
          border-radius: 999px;
          background: #111;
          color: white;
          font-size: 11px;
        }

        .category-bar {
          width: 100%;
          background: white;
          border-bottom: 1px solid #e5e5e5;
        }

        .category-inner {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 10px 24px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .category-button {
          flex: 1 1 0;
          min-width: 0;
          border: 1px solid #ddd;
          background: white;
          border-radius: 999px;
          padding: 10px 12px;
          white-space: nowrap;
          font-weight: 600;
          text-align: center;
        }

        .category-button.active {
          background: #111;
          color: white;
          border-color: #111;
        }

        .hero {
          max-width: 1500px;
          margin: 0 auto;
          padding: 50px 24px 25px;
        }

        .hero-content {
          border-radius: 28px;
          padding: 70px;
          background: #111;
          color: white;
        }

        .hero-eyebrow,
        .eyebrow {
          display: block;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-size: 12px;
          font-weight: 800;
          opacity: 0.65;
          margin-bottom: 12px;
        }

        .hero h1 {
          max-width: 700px;
          margin: 0;
          font-size: clamp(
            40px,
            6vw,
            76px
          );
          line-height: 0.95;
          letter-spacing: -4px;
        }

        .hero p {
          max-width: 620px;
          font-size: 18px;
          line-height: 1.6;
          color: #d7d7d7;
          margin: 25px 0;
        }

        .hero-button {
          border: 0;
          border-radius: 999px;
          padding: 14px 22px;
          background: white;
          color: #111;
          font-weight: 800;
        }

        .products-section {
          max-width: 1500px;
          margin: 0 auto;
          padding: 45px 24px 80px;
        }

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: clamp(
            30px,
            4vw,
            48px
          );
          letter-spacing: -2px;
        }

        .section-heading .eyebrow {
          color: #666;
          margin-bottom: 7px;
        }

        .product-count {
          color: #777;
          font-weight: 700;
          white-space: nowrap;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(
            5,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        .product-card {
          background: white;
          border: 1px solid #e7e7e7;
          border-radius: 18px;
          overflow: hidden;
          min-width: 0;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 35px
              rgba(
                0,
                0,
                0,
                0.08
              );
        }

        .product-image-button {
          display: block;
          width: 100%;
          aspect-ratio: 1;
          padding: 0;
          border: 0;
          background: #f3f3f3;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .product-info {
          padding: 15px;
        }

        .product-category {
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-size: 10px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .product-name {
          border: 0;
          background: transparent;
          padding: 0;
          width: 100%;
          text-align: left;
          font-weight: 700;
          line-height: 1.35;
          min-height: 48px;
          color: #161616;
        }

        .product-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 14px;
        }

        .product-price {
          font-size: 18px;
        }

        .add-button {
          border: 0;
          background: #111;
          color: white;
          border-radius: 999px;
          padding: 8px 13px;
          font-weight: 800;
        }

        .empty-products {
          padding: 80px 20px;
          text-align: center;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 20px;
        }

        .loading {
          min-height: 350px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 15px;
          color: #666;
        }

        .spinner {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 4px solid #ddd;
          border-top-color: #111;
          animation:
            spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .notice {
          margin-bottom: 20px;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          color: #555;
        }

        .modal-backdrop,
        .cart-backdrop,
        .account-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(
            0,
            0,
            0,
            0.58
          );
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .product-modal {
          position: relative;
          width: min(
            1000px,
            100%
          );
          max-height: 90vh;
          overflow: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: white;
          border-radius: 24px;
          overflow: hidden;
        }

        .modal-image-wrap {
          background: #f3f3f3;
          min-height: 500px;
        }

        .modal-image {
          width: 100%;
          height: 100%;
          min-height: 500px;
          object-fit: cover;
        }

        .modal-details {
          padding: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .modal-category {
          text-transform: uppercase;
          color: #888;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .modal-details h2 {
          font-size: 36px;
          line-height: 1.05;
          letter-spacing: -1.5px;
          margin: 12px 0;
        }

        .modal-price {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .modal-details p {
          line-height: 1.7;
          color: #666;
        }

        .modal-add-button {
          margin-top: 25px;
          border: 0;
          background: #111;
          color: white;
          padding: 15px 20px;
          border-radius: 999px;
          font-weight: 800;
        }

        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 2;
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.95
          );
          font-size: 26px;
          line-height: 1;
        }

        .cart-backdrop {
          justify-content: flex-end;
          padding: 0;
        }

        .cart-drawer {
          height: 100%;
          width: min(
            480px,
            100%
          );
          background: white;
          display: flex;
          flex-direction: column;
          box-shadow:
            -15px 0 50px
              rgba(
                0,
                0,
                0,
                0.15
              );
        }

        .cart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px;
          border-bottom: 1px solid #eee;
        }

        .cart-header h2 {
          margin: 0;
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 18px;
        }

        .cart-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .cart-item img {
          width: 82px;
          height: 82px;
          border-radius: 12px;
          object-fit: cover;
          background: #f2f2f2;
        }

        .cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .cart-item-info strong {
          line-height: 1.3;
        }

        .remove-button {
          align-self: flex-start;
          border: 0;
          background: transparent;
          padding: 0;
          color: #777;
          text-decoration: underline;
        }

        .cart-summary {
          border-top: 1px solid #eee;
          padding: 20px;
        }

        .subtotal-row {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
        }

        .checkout-note {
          color: #777;
          font-size: 13px;
          line-height: 1.5;
        }

        .checkout-button {
          width: 100%;
          border: 0;
          border-radius: 999px;
          background: #111;
          color: white;
          padding: 15px;
          font-weight: 800;
        }

        .empty-cart {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px;
          text-align: center;
        }

        .empty-cart-icon {
          font-size: 45px;
          margin-bottom: 10px;
        }

        .account-backdrop {
          z-index: 110;
        }

        .account-modal {
          position: relative;
          width: min(
            520px,
            100%
          );
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 24px;
          padding: 45px;
          box-shadow:
            0 25px 80px
              rgba(
                0,
                0,
                0,
                0.25
              );
        }

        .account-modal h2 {
          margin: 0 0 15px;
          font-size: 38px;
          line-height: 1;
          letter-spacing: -1.5px;
        }

        .account-note {
          color: #666;
          line-height: 1.6;
        }

        .account-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 25px;
        }

        .account-form input {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 14px 15px;
          outline: none;
          background: #fafafa;
        }

        .account-form input:focus {
          border-color: #111;
          background: white;
        }

        .account-form
          .modal-add-button {
          margin-top: 5px;
        }

        .account-switch {
          width: 100%;
          border: 0;
          background: transparent;
          margin-top: 15px;
          padding: 8px;
          color: #555;
          text-decoration: underline;
        }

        .account-error {
          padding: 11px 13px;
          border-radius: 10px;
          background: #f7eeee;
          color: #8a2525;
          font-size: 14px;
        }

        .account-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 15px;
          margin-top: 20px;
          background: #f6f6f4;
          border-radius: 14px;
        }

        .account-info span {
          color: #666;
        }

        .assistant-launcher {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 90;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 0;
          border-radius: 999px;
          padding: 13px 18px;
          background: #111;
          color: white;
          font-weight: 800;
          box-shadow:
            0 12px 35px
              rgba(
                0,
                0,
                0,
                0.2
              );
        }

        .assistant-icon {
          display: inline-flex;
          width: 25px;
          height: 25px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: white;
          color: #111;
        }

        .assistant-panel {
          position: fixed;
          right: 22px;
          bottom: 80px;
          z-index: 91;
          width: min(
            390px,
            calc(100vw - 30px)
          );
          height: min(
            560px,
            calc(100vh - 110px)
          );
          display: flex;
          flex-direction: column;
          background: white;
          border: 1px solid #ddd;
          border-radius: 22px;
          overflow: hidden;
          box-shadow:
            0 25px 70px
              rgba(
                0,
                0,
                0,
                0.22
              );
        }

        .assistant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 17px;
          background: #111;
          color: white;
        }

        .assistant-header div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .assistant-header span {
          font-size: 11px;
          opacity: 0.65;
        }

        .assistant-close {
          border: 0;
          background: transparent;
          color: white;
          font-size: 25px;
        }

        .assistant-messages {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background: #f7f7f5;
        }

        .assistant-message {
          max-width: 85%;
          margin-bottom: 10px;
          padding: 11px 13px;
          border-radius: 14px;
          background: white;
          border: 1px solid #e5e5e5;
          line-height: 1.45;
          font-size: 14px;
        }

        .user-message {
          margin-left: auto;
          background: #111;
          color: white;
          border-color: #111;
        }

        .assistant-suggestions {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding: 10px 12px;
          border-top: 1px solid #eee;
        }

        .assistant-suggestions button {
          flex: 0 0 auto;
          border: 1px solid #ddd;
          background: white;
          border-radius: 999px;
          padding: 8px 11px;
          font-size: 11px;
          font-weight: 700;
        }

        .assistant-form {
          display: flex;
          padding: 12px;
          gap: 8px;
          border-top: 1px solid #eee;
        }

        .assistant-form input {
          flex: 1;
          min-width: 0;
          border: 1px solid #ddd;
          border-radius: 999px;
          padding: 11px 14px;
          outline: none;
        }

        .assistant-form button {
          border: 0;
          border-radius: 999px;
          background: #111;
          color: white;
          padding: 0 16px;
          font-weight: 800;
        }

        .footer {
          background: #111;
          color: white;
          padding: 55px 24px 25px;
        }

        .footer-inner {
          max-width: 1500px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 50px;
        }

        .footer-logo {
          font-size: 30px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .footer p {
          color: #aaa;
        }

        .footer h4 {
          margin-top: 0;
        }

        .footer button {
          display: block;
          border: 0;
          background: transparent;
          color: #aaa;
          padding: 5px 0;
          text-align: left;
        }

        .footer-bottom {
          max-width: 1500px;
          margin: 45px auto 0;
          padding-top: 20px;
          border-top: 1px solid #333;
          color: #777;
          font-size: 13px;
        }

        @media (max-width: 1200px) {
          .product-grid {
            grid-template-columns: repeat(
              4,
              minmax(0, 1fr)
            );
          }

          .header-actions {
            gap: 2px;
          }
        }

        @media (max-width: 900px) {
          .header-inner {
            flex-wrap: wrap;
          }

          .logo {
            order: 1;
          }

          .header-actions {
            order: 2;
            margin-left: auto;
          }

          .search-form {
            order: 3;
            flex-basis: 100%;
            max-width: none;
          }

          .product-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }

          .hero-content {
            padding: 45px 30px;
          }

          .product-modal {
            grid-template-columns: 1fr;
          }

          .modal-image-wrap,
          .modal-image {
            min-height: 350px;
          }

          .account-modal {
            padding: 35px 25px;
          }

          .category-button {
            flex: 0 0 auto;
            min-width: 105px;
          }
        }

        @media (max-width: 600px) {
          .header-inner {
            padding: 10px 15px;
          }

          .header-actions > button {
            font-size: 12px;
            padding: 8px 4px;
          }

          .category-inner {
            padding: 8px 15px;
          }

          .category-button {
            min-width: 100px;
          }

          .hero {
            padding: 20px 15px;
          }

          .hero-content {
            padding: 40px 24px;
            border-radius: 20px;
          }

          .hero h1 {
            letter-spacing: -2px;
          }

          .products-section {
            padding: 35px 15px 60px;
          }

          .section-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .product-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 10px;
          }

          .product-info {
            padding: 10px;
          }

          .product-name {
            font-size: 14px;
          }

          .product-price {
            font-size: 15px;
          }

          .add-button {
            padding: 7px 10px;
            font-size: 12px;
          }

          .modal-details {
            padding: 30px 22px;
          }

          .footer-inner {
            grid-template-columns: 1fr;
          }

          .account-modal h2 {
            font-size: 32px;
          }

          .assistant-launcher {
            right: 12px;
            bottom: 12px;
            padding: 11px 14px;
            font-size: 13px;
          }

          .assistant-panel {
            right: 12px;
            bottom: 70px;
          }
        }
      `}</style>
    </main>
  );
}
