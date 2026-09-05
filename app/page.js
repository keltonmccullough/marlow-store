"use client";

import { useEffect, useMemo, useState } from "react";

const HOME_PRODUCT_LIMIT = 375;
const PAGE_SIZE = 100;

const CATEGORIES = [
  "All",
  "Electronics",
  "Home",
  "Clothing",
  "Beauty",
  "Sports",
  "Toys",
  "Travel",
  "Tools",
];

const CATEGORY_SEARCHES = {
  All: "popular products",
  Electronics: "electronics",
  Home: "home kitchen decor",
  Clothing: "clothing apparel fashion",
  Beauty: "beauty skincare",
  Sports: "fitness sports",
  Toys: "toys kids",
  Travel: "travel luggage",
  Tools: "tools",
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
    product?.product?.productName ||
    product?.product?.name ||
    product?.product?.title ||
    "Marlow Product"
  );
}

function getSupplierImage(product) {
  return (
    product?.productImage ||
    product?.image ||
    product?.imageUrl ||
    product?.product?.productImage ||
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
    product?.price,
    product?.cost,
    product?.productPrice,
    product?.product?.sellPrice,
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
    product?.product?.pid ||
    product?.product?.productId ||
    product?.product?.id ||
    null
  );
}

/*
 * This is the main duplicate-protection system.
 *
 * If CJ gives us a real product ID, that ID is always preferred.
 * If a product does not contain an ID, name + image is used as
 * a fallback fingerprint.
 */
function getUniqueProductKey(product) {
  const cjId = getCJProductId(product);

  if (cjId) {
    return `cj-${String(cjId).trim()}`;
  }

  const name = String(
    getSupplierName(product) || ""
  )
    .trim()
    .toLowerCase();

  const image = String(
    getSupplierImage(product) || ""
  )
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

    if (seen.has(key)) {
      continue;
    }

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

  /*
   * Check clothing before electronics because products such as
   * "smart watch clothing..." should still be classified by the
   * strongest clothing terms when applicable.
   */

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
  if (category === "All") {
    return true;
  }

  return product?.category === category;
}

/* =========================================================
   CJ API
========================================================= */

async function fetchCJPage(query, page) {
  const params = new URLSearchParams();

  params.set("q", query);
  params.set("page", String(page));
  params.set("size", String(PAGE_SIZE));

  const response = await fetch(
    `/api/search?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Search request failed: ${response.status}`
    );
  }

  const data = await response.json();

  if (!data || typeof data !== "object") {
    throw new Error("Invalid catalog response.");
  }

  return data;
}

/*
 * IMPORTANT:
 *
 * There is NO artificial maxProducts limit here.
 * There is NO artificial maxPages limit here.
 *
 * CJ controls when the catalog is exhausted through hasMore.
 *
 * This means:
 *
 * page 1
 * page 2
 * page 3
 * page 4
 * ...
 * until CJ says there are no more pages.
 */
async function fetchAllCJPages(query) {
  let page = 1;
  let hasMore = true;

  const allProducts = [];
  const seen = new Set();

  while (hasMore) {
    const data = await fetchCJPage(
      query,
      page
    );

    const batch = Array.isArray(data?.products)
      ? data.products
      : [];

    if (batch.length === 0) {
      break;
    }

    for (const product of batch) {
      const key = getUniqueProductKey(product);

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      allProducts.push(product);
    }

    hasMore =
      Boolean(data?.hasMore) &&
      batch.length > 0;

    page += 1;

    /*
     * Prevent a broken API response from creating an
     * accidental infinite loop.
     *
     * This is NOT a product limit.
     * It only stops if CJ keeps returning the exact
     * same page forever.
     */
    if (page > 1 && batch.length === 0) {
      break;
    }
  }

  return allProducts;
}

/* =========================================================
   CATEGORY LOADING
========================================================= */

async function fetchCategoryProducts(category) {
  const queries =
    CATEGORY_VARIANTS[category] || [
      CATEGORY_SEARCHES[category],
    ];

  let products = [];

  /*
   * Each search variant is exhausted completely.
   *
   * Results are combined and deduplicated afterward.
   */
  for (const query of queries) {
    if (!query) continue;

    try {
      const results =
        await fetchAllCJPages(query);

      products = uniqueProducts([
        ...products,
        ...results,
      ]);
    } catch (error) {
      console.error(
        `Category search failed for ${query}`,
        error
      );
    }
  }

  const converted = products
    .map((product, index) =>
      convertSupplierProduct(
        product,
        index
      )
    )
    .filter(Boolean);

  const categorized = converted.filter(
    (product) =>
      matchesCategory(
        product,
        category
      )
  );

  /*
   * If the classifier couldn't identify any products,
   * keep the actual CJ results rather than showing
   * "no products" incorrectly.
   */
  if (categorized.length === 0) {
    return sortProducts(
      uniqueProducts(converted)
    );
  }

  return sortProducts(
    uniqueProducts(categorized)
  );
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
            ${Number(
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
        <h3>No products available</h3>

        <p>
          Try another category or search
          for something else.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpen={onOpen}
          onAdd={onAdd}
        />
      ))}
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

          <h2>{product.name}</h2>

          <div className="modal-price">
            ${Number(
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

    if (mode === "create") {
      onCreateAccount({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      setPassword("");
      return;
    }

    /*
     * The parent handles the stored account
     * and validates the sign-in.
     */
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
              Your Marlow account is available
              whenever you return to this
              browser.
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
              Create an account so you can
              return to Marlow and access
              your account anytime.
            </p>

            <form
              className="account-form"
              onSubmit={handleSubmit}
            >
              {mode === "create" && (
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
          <h2>Your Cart</h2>

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
              Add something you love
              from Marlow.
            </p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
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
              ))}
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
                Tax and shipping will
                be calculated during
                secure checkout.
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
   HOME
========================================================= */

export default function Home() {
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

  /* =======================================================
     LOAD SAVED CART + ACCOUNT
  ======================================================= */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          "marlow-cart"
        );

      if (savedCart) {
        const parsed =
          JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }

      const savedAccount =
        localStorage.getItem(
          "marlow-account"
        );

      if (savedAccount) {
        const parsed =
          JSON.parse(savedAccount);

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
        "Marlow local storage error:",
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
        JSON.stringify(cart)
      );
    } catch (storageError) {
      console.error(
        "Could not save Marlow cart:",
        storageError
      );
    }
  }, [cart]);

  /* =======================================================
     HOME PAGE — GET 375 UNIQUE PRODUCTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadHomeProducts() {
      setLoadingHome(true);
      setError("");

      const queries = [
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

      let collected = [];

      try {
        /*
         * Continue through the catalog searches until
         * we have at least 375 UNIQUE usable candidates.
         *
         * Search itself is never limited to 375.
         */
        for (const query of queries) {
          if (cancelled) {
            return;
          }

          const results =
            await fetchAllCJPages(
              query
            );

          collected =
            uniqueProducts([
              ...collected,
              ...results,
            ]);

          /*
           * Once we have more than 375 candidates,
           * we can stop searching additional broad
           * home queries.
           *
           * This does NOT limit the search feature.
           */
          if (
            collected.length >=
            HOME_PRODUCT_LIMIT
          ) {
            break;
          }
        }

        const converted =
          collected
            .map(
              (product, index) =>
                convertSupplierProduct(
                  product,
                  index
                )
            )
            .filter(Boolean);

        const unique =
          uniqueProducts(
            converted
          );

        const finalProducts =
          sortProducts(
            unique
          ).slice(
            0,
            HOME_PRODUCT_LIMIT
          );

        if (!cancelled) {
          setHomeProducts(
            finalProducts
          );

          if (
            finalProducts.length <
            HOME_PRODUCT_LIMIT
          ) {
            setError(
              `Marlow loaded ${finalProducts.length} live products because the available CJ catalog returned fewer usable unique products for the home collection.`
            );
          }
        }
      } catch (err) {
        console.error(
          "Home catalog error:",
          err
        );

        if (!cancelled) {
          setError(
            "We couldn't load the live product catalog right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHome(false);
        }
      }
    }

    loadHomeProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     CATEGORY PAGE — ALL AVAILABLE MATCHING PRODUCTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadCategory() {
      if (category === "All") {
        setCategoryProducts([]);
        return;
      }

      setLoadingCategory(true);
      setError("");

      try {
        const products =
          await fetchCategoryProducts(
            category
          );

        if (!cancelled) {
          setCategoryProducts(
            uniqueProducts(products)
          );
        }
      } catch (err) {
        console.error(
          "Category loading error:",
          err
        );

        if (!cancelled) {
          setCategoryProducts([]);
          setError(
            "We couldn't load this category right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCategory(false);
        }
      }
    }

    loadCategory();

    return () => {
      cancelled = true;
    };
  }, [category]);

  /* =======================================================
     SEARCH — ALL MATCHING CJ RESULTS
  ======================================================= */

  async function performSearch(query) {
    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      setSubmittedSearch("");
      setSearchProducts([]);
      setError("");
      return;
    }

    setSearching(true);
    setSubmittedSearch(
      cleanQuery
    );
    setCategory("All");
    setError("");

    try {
      /*
       * fetchAllCJPages continues until CJ says
       * there are no more pages.
       *
       * There is NO 100-result, 375-result,
       * or 5,000-result search cap.
       */
      const results =
        await fetchAllCJPages(
          cleanQuery
        );

      const converted =
        results
          .map(
            (product, index) =>
              convertSupplierProduct(
                product,
                index
              )
          )
          .filter(Boolean);

      const unique =
        uniqueProducts(
          converted
        );

      /*
       * Do not slice this array.
       *
       * Search results remain ALL unique
       * matching results returned by CJ.
       */
      setSearchProducts(
        sortProducts(unique)
      );
    } catch (err) {
      console.error(
        "Search error:",
        err
      );

      setSearchProducts([]);

      setError(
        "We couldn't complete that search right now."
      );
    } finally {
      setSearching(false);
    }
  }

  /* =======================================================
     ACCOUNT
  ======================================================= */

  function handleAccountSubmit(data) {
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

    /*
     * SIGN IN
     */
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
          JSON.parse(stored);

        if (
          saved.email !== email ||
          saved.password !== password
        ) {
          alert(
            "The email or password is incorrect."
          );
          return;
        }

        setAccount(saved);
        return;
      } catch (error) {
        console.error(
          "Account sign-in error:",
          error
        );

        alert(
          "We couldn't sign you in right now."
        );

        return;
      }
    }

    /*
     * CREATE ACCOUNT
     */
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
    } catch (error) {
      console.error(
        "Account creation error:",
        error
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

  function addToCart(product) {
    setCart((current) => {
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
    });

    setCartOpen(true);
  }

  function removeFromCart(id) {
    setCart((current) =>
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
      if (submittedSearch) {
        /*
         * ALL search results.
         */
        return searchProducts;
      }

      if (category !== "All") {
        /*
         * ALL products loaded for this category.
         */
        return categoryProducts;
      }

      /*
       * Home page only:
       * exactly up to 375 unique products.
       */
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
              setCategory("All");
              setSubmittedSearch("");
              setSearch("");
              setError("");
            }}
          >
            Marlow
          </button>

          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault();

              performSearch(
                search
              );
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
                  setAccountOpen(
                    true
                  );

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
                  category ===
                    item &&
                  !submittedSearch
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => {
                  setCategory(
                    item
                  );

                  setSubmittedSearch(
                    ""
                  );

                  setSearch("");

                  setSearchProducts(
                    []
                  );

                  setError("");
                }}
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
                electronics, home,
                clothing, beauty,
                sports, travel and
                more.
              </p>

              <button
                className="hero-button"
                onClick={() => {
                  document
                    .getElementById(
                      "products"
                    )
                    ?.scrollIntoView(
                      {
                        behavior:
                          "smooth",
                      }
                    );
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
                  {
                    submittedSearch
                  }
                  "
                </h2>
              </>
            ) : category !==
              "All" ? (
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
                  All{" "}
                  {
                    HOME_PRODUCT_LIMIT
                  }{" "}
                  Products
                </h2>
              </>
            )}
          </div>

          {!submittedSearch &&
            category ===
              "All" &&
            !loadingHome && (
              <div className="product-count">
                {
                  displayedProducts.length
                }{" "}
                products
              </div>
            )}

          {submittedSearch &&
            !searching && (
              <div className="product-count">
                {
                  displayedProducts.length
                }{" "}
                results
              </div>
            )}

          {!submittedSearch &&
            category !==
              "All" &&
            !loadingCategory && (
              <div className="product-count">
                {
                  displayedProducts.length
                }{" "}
                products
              </div>
            )}
        </div>

        {error && (
          <div className="notice">
            {error}
          </div>
        )}

        {loadingHome ||
        loadingCategory ||
        searching ? (
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
            onOpen={
              setSelectedProduct
            }
            onAdd={
              addToCart
            }
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
            <h4>Shop</h4>

            {CATEGORIES.slice(
              1
            ).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setCategory(
                    item
                  );

                  setSubmittedSearch(
                    ""
                  );

                  setSearch("");

                  window.scrollTo(
                    {
                      top: 0,
                      behavior:
                        "smooth",
                    }
                  );
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          ©{" "}
          {new Date().getFullYear()}{" "}
          Marlow. All rights
          reserved.
        </div>
      </footer>

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
            setAccountOpen(
              false
            )
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
          border-bottom: 1px solid
            #e5e5e5;
          backdrop-filter: blur(
            12px
          );
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
          border: 1px solid
            #dedede;
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
          background: white;
          border-bottom: 1px solid
            #e5e5e5;
        }

        .category-inner {
          max-width: 1500px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .category-button {
          border: 1px solid
            #ddd;
          background: white;
          border-radius: 999px;
          padding: 9px 16px;
          white-space: nowrap;
          font-weight: 600;
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

        .section-heading
          .eyebrow {
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
          border: 1px solid
            #e7e7e7;
          border-radius: 18px;
          overflow: hidden;
          min-width: 0;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(
            -3px
          );
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
          border: 1px solid
            #e5e5e5;
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
          border: 4px solid
            #ddd;
          border-top-color: #111;
          animation: spin
            0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(
              360deg
            );
          }
        }

        .notice {
          margin-bottom: 20px;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid
            #ddd;
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
          border-bottom: 1px solid
            #eee;
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
          border-bottom: 1px solid
            #eee;
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
          border-top: 1px solid
            #eee;
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

        /* ACCOUNT */

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
          border: 1px solid
            #ddd;
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
          border-top: 1px solid
            #333;
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
        }
      `}</style>
    </main>
  );
}
