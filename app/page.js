"use client";

import { useEffect, useMemo, useState } from "react";

/*
  MARLOW STOREFRONT

  This page:
  - Keeps the Marlow storefront design.
  - Loads a large selection of CJ products for browsing.
  - Targets up to 150 homepage products.
  - Organizes products into Marlow categories.
  - Uses CJ search for customer searches.
  - Removes duplicate products.
  - Does not claim "no products" until CJ has actually been searched.
  - Keeps the existing automatic pricing system for now.
*/

const categories = [
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

const categorySearches = [
  "popular products",
  "electronics",
  "clothing",
  "beauty",
  "sports",
  "toys",
  "travel",
  "tools",
  "home",
  "gadgets",
  "accessories",
  "daily essentials",
];

const fallbackProducts = [
  {
    id: "fallback-1",
    name: "Wireless Noise-Canceling Headphones",
    price: 89.99,
    oldPrice: 129.99,
    category: "Electronics",
    rating: 4.8,
    reviews: 2841,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=90",
    description:
      "Premium wireless headphones designed for immersive sound and comfortable everyday listening.",
    demo: true,
  },
  {
    id: "fallback-2",
    name: "Premium Smart Watch",
    price: 79.99,
    oldPrice: 119.99,
    category: "Electronics",
    rating: 4.7,
    reviews: 1934,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90",
    description:
      "A modern smartwatch with activity tracking and everyday notifications.",
    demo: true,
  },
  {
    id: "fallback-3",
    name: "Insulated Stainless Steel Bottle",
    price: 29.99,
    oldPrice: 39.99,
    category: "Home",
    rating: 4.9,
    reviews: 3267,
    badge: "Top Rated",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=90",
    description:
      "Durable insulated bottle designed for hot and cold drinks.",
    demo: true,
  },
  {
    id: "fallback-4",
    name: "Portable Wireless Speaker",
    price: 44.99,
    oldPrice: 59.99,
    category: "Electronics",
    rating: 4.7,
    reviews: 1482,
    badge: "Deal",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=90",
    description:
      "Compact wireless speaker with rich audio and portable design.",
    demo: true,
  },
  {
    id: "fallback-5",
    name: "Modern LED Desk Lamp",
    price: 34.99,
    oldPrice: 49.99,
    category: "Home",
    rating: 4.8,
    reviews: 921,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=90",
    description:
      "Clean modern lighting for desks, bedrooms, offices, and studying.",
    demo: true,
  },
  {
    id: "fallback-6",
    name: "Everyday Travel Backpack",
    price: 54.99,
    oldPrice: 74.99,
    category: "Travel",
    rating: 4.8,
    reviews: 1763,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=90",
    description:
      "A versatile backpack with organized storage for work, school, electronics, and travel.",
    demo: true,
  },
  {
    id: "fallback-7",
    name: "Ultra Soft Home Throw",
    price: 39.99,
    oldPrice: 54.99,
    category: "Home",
    rating: 4.9,
    reviews: 2478,
    badge: "Top Rated",
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=90",
    description:
      "A soft comfortable throw designed to add warmth and style to your home.",
    demo: true,
  },
  {
    id: "fallback-8",
    name: "Kitchen Organization Collection",
    price: 31.99,
    oldPrice: 44.99,
    category: "Home",
    rating: 4.7,
    reviews: 1107,
    badge: "Deal",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=90",
    description:
      "Practical organization pieces designed to make kitchen storage easier.",
    demo: true,
  },
];

function getSupplierName(item) {
  return (
    item?.productName ||
    item?.nameEn ||
    item?.name ||
    item?.title ||
    item?.productTitle ||
    "Supplier Product"
  )
    .toString()
    .trim();
}

function getSupplierImage(item) {
  return (
    item?.bigImage ||
    item?.productImage ||
    item?.productImageUrl ||
    item?.image ||
    item?.imageUrl ||
    item?.img ||
    ""
  )
    .toString()
    .trim();
}

function getSupplierCost(item) {
  const values = [
    item?.nowPrice,
    item?.sellPrice,
    item?.productPrice,
    item?.price,
    item?.minPrice,
    item?.costPrice,
  ];

  for (const value of values) {
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

/*
  Current Marlow pricing rule.

  This remains in place while we finish
  the catalog. We will make the pricing
  smarter in the next pricing pass.
*/
function calculateMarlowPrice(cost) {
  const numericCost = Number(cost);

  if (
    !Number.isFinite(numericCost) ||
    numericCost <= 0
  ) {
    return 0;
  }

  let markup;

  if (numericCost < 10) {
    markup = 0.25;
  } else if (numericCost < 25) {
    markup = 0.22;
  } else if (numericCost < 50) {
    markup = 0.18;
  } else if (numericCost < 100) {
    markup = 0.15;
  } else if (numericCost < 200) {
    markup = 0.12;
  } else {
    markup = 0.10;
  }

  return Math.max(
    numericCost * (1 + markup),
    numericCost + 1
  );
}

function inferCategory(item) {
  const raw = [
    item?.categoryName,
    item?.categoryNameEn,
    item?.category,
    item?.productName,
    item?.nameEn,
    item?.name,
    item?.title,
    item?.productTitle,
    item?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    /phone|iphone|android|charger|cable|headphone|earbud|speaker|tablet|computer|laptop|keyboard|mouse|watch|camera|electronic|gaming|usb|bluetooth|power bank|projector|monitor/.test(
      raw
    )
  ) {
    return "Electronics";
  }

  if (
    /shirt|t-shirt|tshirt|hoodie|jacket|coat|dress|jean|pants|shorts|sock|shoe|sneaker|boot|clothing|apparel|hat|cap|fashion/.test(
      raw
    )
  ) {
    return "Clothing";
  }

  if (
    /makeup|cosmetic|lipstick|mascara|foundation|skincare|skin care|serum|cream|beauty|hair|shampoo|conditioner|brush|perfume|fragrance|nail/.test(
      raw
    )
  ) {
    return "Beauty";
  }

  if (
    /football|basketball|baseball|soccer|golf|tennis|fitness|gym|exercise|yoga|sport|sports|workout|athletic|camping|hiking/.test(
      raw
    )
  ) {
    return "Sports";
  }

  if (
    /toy|kids|kid|child|children|puzzle|doll|remote control|building block|plush|stuffed|game|educational/.test(
      raw
    )
  ) {
    return "Toys";
  }

  if (
    /travel|luggage|suitcase|backpack|passport|neck pillow|travel bag|organizer|camping bag/.test(
      raw
    )
  ) {
    return "Travel";
  }

  if (
    /tool|drill|screwdriver|wrench|hammer|pliers|hardware|repair|workshop|measuring|hand tool|power tool/.test(
      raw
    )
  ) {
    return "Tools";
  }

  if (
    /home|kitchen|storage|lamp|light|blanket|pillow|bedding|furniture|bathroom|decor|organizer|cookware|utensil|garden/.test(
      raw
    )
  ) {
    return "Home";
  }

  return "Home";
}

function convertSupplierProduct(
  item,
  index,
  searchTerm = ""
) {
  const cost =
    getSupplierCost(item);

  const sellingPrice =
    calculateMarlowPrice(cost);

  const image =
    getSupplierImage(item);

  const name =
    getSupplierName(item);

  const id =
    item?.pid ||
    item?.productId ||
    item?.id ||
    item?.sku ||
    item?.productSku ||
    `cj-${searchTerm}-${index}-${name}`;

  return {
    id: String(id),
    name,
    price: sellingPrice,
    oldPrice:
      sellingPrice > 0
        ? sellingPrice * 1.15
        : 0,
    category:
      inferCategory(item),
    rating:
      Number(item?.rating) || 4.5,
    reviews:
      Number(item?.reviewCount) || 0,
    badge: "Marlow Pick",
    image,
    description:
      item?.description ||
      item?.productDescription ||
      "Product supplied through Marlow's authorized supplier catalog.",
    supplierCost: cost,
    supplierProduct: item,
    supplier: "CJ Dropshipping",
    demo: false,
  };
}

function uniqueProducts(products) {
  const seen = new Set();
  const result = [];

  for (const item of products) {
    const id =
      String(item.id);

    const nameKey =
      item.name
        ?.toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const key =
      id !== "undefined"
        ? `id:${id}`
        : `name:${nameKey}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

function ProductCard({
  item,
  addToCart,
  buyNow,
  openProduct,
}) {
  return (
    <article className="card">
      <button
        className="photo-button"
        onClick={() =>
          openProduct(item)
        }
      >
        <div className="photo">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
          />

          <span className="badge">
            {item.badge}
          </span>
        </div>

        <div className="info">
          <div className="category">
            {item.category}
          </div>

          <div className="name">
            {item.name}
          </div>

          <div className="rating">
            <span className="stars">
              ★★★★★
            </span>{" "}
            {item.rating}

            {item.reviews > 0 &&
              ` (${item.reviews.toLocaleString()})`}
          </div>

          <div className="price-row">
            <span className="price">
              $
              {Number(
                item.price
              ).toFixed(2)}
            </span>

            {item.oldPrice >
              item.price && (
              <span className="old">
                $
                {Number(
                  item.oldPrice
                ).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="actions">
        <button
          className="add"
          onClick={() =>
            addToCart(item)
          }
        >
          Add to Cart
        </button>

        <button
          className="buy"
          onClick={() =>
            buyNow(item)
          }
        >
          Buy Now
        </button>
      </div>
    </article>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  addToCart,
  buyNow,
  openProduct,
}) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <span className="section-count">
          {products.length} products
        </span>
      </div>

      <div className="products">
        {products.map(
          (item) => (
            <ProductCard
              key={item.id}
              item={item}
              addToCart={
                addToCart
              }
              buyNow={buyNow}
              openProduct={
                openProduct
              }
            />
          )
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [product, setProduct] =
    useState(null);

  const [cartOpen, setCartOpen] =
    useState(false);

  const [cart, setCart] =
    useState([]);

  const [
    supplierProducts,
    setSupplierProducts,
  ] = useState([]);

  const [
    homeProducts,
    setHomeProducts,
  ] = useState([]);

  const [
    searchingSupplier,
    setSearchingSupplier,
  ] = useState(false);

  const [
    loadingHomeProducts,
    setLoadingHomeProducts,
  ] = useState(false);

  const [
    supplierSearched,
    setSupplierSearched,
  ] = useState(false);

  const [
    supplierError,
    setSupplierError,
  ] = useState("");

  const [
    homeError,
    setHomeError,
  ] = useState("");

  const displayProducts =
    search.trim().length > 0
      ? supplierProducts
      : category !== "All"
        ? homeProducts.filter(
            (item) =>
              item.category ===
              category
          )
        : homeProducts;

  const filtered = useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    return displayProducts.filter(
      (item) => {
        const categoryMatch =
          category === "All" ||
          item.category ===
            category;

        const searchMatch =
          !query ||
          item.name
            .toLowerCase()
            .includes(query) ||
          item.category
            .toLowerCase()
            .includes(query) ||
          item.description
            .toLowerCase()
            .includes(query);

        return (
          categoryMatch &&
          searchMatch
        );
      }
    );
  }, [
    search,
    category,
    displayProducts,
  ]);

  const cartCount =
    cart.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

  const cartTotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );

  async function loadHomeProducts() {
    setLoadingHomeProducts(
      true
    );
    setHomeError("");

    try {
      const responses =
        await Promise.allSettled(
          categorySearches.map(
            (term) =>
              fetch(
                `/api/search?q=${encodeURIComponent(
                  term
                )}`
              )
          )
        );

      const allProducts = [];

      for (
        let i = 0;
        i <
        responses.length;
        i++
      ) {
        const result =
          responses[i];

        if (
          result.status !==
          "fulfilled"
        ) {
          continue;
        }

        if (
          !result.value.ok
        ) {
          continue;
        }

        try {
          const data =
            await result.value.json();

          const raw =
            Array.isArray(
              data?.products
            )
              ? data.products
              : [];

          raw.forEach(
            (item, index) => {
              const converted =
                convertSupplierProduct(
                  item,
                  index,
                  categorySearches[
                    i
                  ]
                );

              if (
                converted.image &&
                converted.price >
                  0
              ) {
                allProducts.push(
                  converted
                );
              }
            }
          );
        } catch {
          continue;
        }
      }

      const unique =
        uniqueProducts(
          allProducts
        );

      /*
        We want up to 150 different
        real CJ products on the
        browsing page.
      */

      const live =
        unique.slice(
          0,
          150
        );

      /*
        Only use fallback products
        when CJ doesn't provide enough
        usable products.

        This keeps the storefront
        from looking empty while the
        live catalog grows.
      */

      const combined =
        uniqueProducts([
          ...live,
          ...fallbackProducts,
        ]).slice(
          0,
          150
        );

      setHomeProducts(
        combined
      );

      if (
        unique.length === 0
      ) {
        setHomeError(
          "The live CJ catalog did not return usable products. Marlow is showing temporary display products while the catalog connection is being expanded."
        );
      }
    } catch (error) {
      console.error(
        "Home catalog error:",
        error
      );

      setHomeProducts(
        fallbackProducts
      );

      setHomeError(
        "The live catalog is temporarily unavailable."
      );
    } finally {
      setLoadingHomeProducts(
        false
      );
    }
  }

  useEffect(() => {
    loadHomeProducts();
  }, []);

  async function searchSupplierCatalog(
    query
  ) {
    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      setSupplierProducts(
        []
      );
      setSupplierError("");
      setSupplierSearched(
        false
      );
      return;
    }

    setSearchingSupplier(
      true
    );
    setSupplierError("");
    setSupplierSearched(
      false
    );

    try {
      const response =
        await fetch(
          `/api/search?q=${encodeURIComponent(
            cleanQuery
          )}`
        );

      const data =
        await response.json();

      /*
        CJ was actually searched.
        From this point forward,
        a zero-result response is
        a legitimate "no products"
        result.
      */

      setSupplierSearched(
        true
      );

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.message ||
            "CJ search failed."
        );
      }

      const rawProducts =
        Array.isArray(
          data?.products
        )
          ? data.products
          : [];

      const converted =
        rawProducts
          .map(
            (item, index) =>
              convertSupplierProduct(
                item,
                index,
                cleanQuery
              )
          )
          .filter(
            (item) =>
              item.image &&
              item.price > 0
          );

      setSupplierProducts(
        uniqueProducts(
          converted
        )
      );

      if (
        converted.length ===
        0
      ) {
        setSupplierError(
          ""
        );
      }
    } catch (error) {
      console.error(
        "CJ search error:",
        error
      );

      setSupplierProducts(
        []
      );

      setSupplierSearched(
        true
      );

      setSupplierError(
        error?.message ||
          "Unable to connect to the CJ supplier catalog."
      );
    } finally {
      setSearchingSupplier(
        false
      );
    }
  }

  function handleSearchChange(
    value
  ) {
    setSearch(value);

    setProduct(null);
    setCartOpen(false);

    if (!value.trim()) {
      setSupplierProducts(
        []
      );
      setSupplierError("");
      setSupplierSearched(
        false
      );
    }
  }

  function handleSearchSubmit() {
    if (search.trim()) {
      setCategory("All");
      searchSupplierCatalog(
        search
      );
    }
  }

  function openProduct(item) {
    setProduct(item);
    setCartOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function addToCart(item) {
    setCart((current) => {
      const existing =
        current.find(
          (x) =>
            x.id === item.id
        );

      if (existing) {
        return current.map(
          (x) =>
            x.id === item.id
              ? {
                  ...x,
                  quantity:
                    x.quantity +
                    1,
                }
              : x
        );
      }

      return [
        ...current,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }

  function buyNow(item) {
    addToCart(item);
    setProduct(null);
    setCartOpen(true);
  }

  function updateQuantity(
    id,
    amount
  ) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity +
                  amount,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function showHome() {
    setProduct(null);
    setCartOpen(false);
    setSearch("");
    setCategory("All");
    setSupplierProducts(
      []
    );
    setSupplierError("");
    setSupplierSearched(
      false
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const featuredProducts =
    homeProducts.slice(
      0,
      12
    );

  const trendingProducts =
    homeProducts.slice(
      12,
      24
    );

  const miscellaneousProducts =
    homeProducts.slice(
      24,
      72
    );

  const electronicsProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Electronics"
      )
      .slice(
        0,
        18
      );

  const clothingProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Clothing"
      )
      .slice(
        0,
        18
      );

  const beautyProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Beauty"
      )
      .slice(
        0,
        18
      );

  const sportsProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Sports"
      )
      .slice(
        0,
        18
      );

  const toysProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Toys"
      )
      .slice(
        0,
        18
      );

  const travelProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Travel"
      )
      .slice(
        0,
        18
      );

  const toolsProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Tools"
      )
      .slice(
        0,
        18
      );

  const homeCategoryProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Home"
      )
      .slice(
        0,
        18
      );

  const dealProducts =
    homeProducts
      .filter(
        (item) =>
          item.oldPrice >
          item.price
      )
      .slice(
        0,
        12
      );

  return (
    <>
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
          color: #171717;
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

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(
            255,
            255,
            255,
            0.97
          );
          backdrop-filter: blur(12px);
          border-bottom:
            1px solid #e8e8e8;
        }

        .header-main {
          max-width: 1440px;
          margin: auto;
          padding: 17px 28px;
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .brand {
          border: 0;
          background: transparent;
          padding: 0;
          text-align: left;
          min-width: 145px;
        }

        .brand-name {
          font-size: 31px;
          font-weight: 900;
          letter-spacing: -2px;
        }

        .brand-sub {
          display: block;
          margin-top: 1px;
          font-size: 10px;
          color: #777;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .search {
          flex: 1;
          height: 50px;
          max-width: 760px;
          display: flex;
          background: #f4f4f2;
          border: 1px solid #dcdcdc;
          border-radius: 9px;
          overflow: hidden;
        }

        .search:focus-within {
          border-color: #222;
          background: white;
        }

        .search input {
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          padding: 0 18px;
          font-size: 15px;
        }

        .search button {
          width: 55px;
          border: 0;
          background: #171717;
          color: white;
          font-size: 21px;
        }

        .search button:disabled {
          opacity: 0.65;
        }

        .header-links {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-left: auto;
        }

        .header-link {
          border: 0;
          background: transparent;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .cart {
          border: 1px solid #d4d4d4;
          background: white;
          border-radius: 8px;
          padding: 11px 15px;
          font-weight: 800;
          white-space: nowrap;
        }

        .cart span {
          display: inline-flex;
          min-width: 22px;
          height: 22px;
          justify-content: center;
          align-items: center;
          margin-left: 5px;
          border-radius: 20px;
          background: #171717;
          color: white;
          font-size: 11px;
        }

        .nav {
          border-top:
            1px solid #eeeeee;
          background: white;
          overflow-x: auto;
        }

        .nav-inner {
          max-width: 1440px;
          margin: auto;
          padding: 0 28px;
          display: flex;
          gap: 5px;
        }

        .nav button {
          border: 0;
          background: transparent;
          padding: 13px 17px;
          color: #555;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .nav button.active {
          color: #111;
          box-shadow:
            inset 0 -2px #111;
        }

        .container {
          max-width: 1440px;
          margin: auto;
          padding: 28px;
        }

        .hero {
          min-height: 390px;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
          background:
            linear-gradient(
              90deg,
              #171717 0%,
              #292929 58%,
              #404040 100%
            );
          color: white;
          display: flex;
          align-items: center;
          padding: 58px;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 690px;
        }

        .hero-kicker {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #d4d4d4;
        }

        .hero h1 {
          margin: 13px 0 16px;
          font-size: clamp(
            42px,
            5vw,
            68px
          );
          line-height: 0.96;
          letter-spacing: -4px;
        }

        .hero p {
          max-width: 570px;
          color: #d1d1d1;
          font-size: 16px;
          line-height: 1.65;
          margin: 0 0 28px;
        }

        .hero-action {
          border: 0;
          background: white;
          color: #111;
          padding: 14px 22px;
          border-radius: 7px;
          font-weight: 900;
        }

        .hero-shape {
          position: absolute;
          width: 500px;
          height: 500px;
          right: -100px;
          top: -55px;
          border-radius: 50%;
          border:
            95px solid
            rgba(
              255,
              255,
              255,
              0.055
            );
        }

        .hero-shape:after {
          content: "";
          position: absolute;
          inset: 45px;
          border-radius: 50%;
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );
        }

        .section {
          margin-top: 42px;
        }

        .section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .section-head h2 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -1px;
        }

        .section-head p {
          margin: 6px 0 0;
          color: #777;
          font-size: 13px;
        }

        .section-count {
          color: #777;
          font-size: 12px;
          font-weight: 800;
        }

        .products {
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );
          gap: 18px;
        }

        .card {
          background: white;
          border:
            1px solid #e5e5e5;
          border-radius: 11px;
          overflow: hidden;
          transition:
            0.2s ease;
        }

        .card:hover {
          transform:
            translateY(-3px);
          box-shadow:
            0 14px 35px
            rgba(
              0,
              0,
              0,
              0.08
            );
        }

        .photo-button {
          display: block;
          width: 100%;
          padding: 0;
          border: 0;
          background: white;
          text-align: left;
        }

        .photo {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #f1f1ef;
        }

        .photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition:
            transform 0.3s ease;
        }

        .card:hover
          .photo
          img {
          transform:
            scale(1.035);
        }

        .badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: white;
          border-radius: 5px;
          padding: 6px 8px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          box-shadow:
            0 3px 10px
            rgba(
              0,
              0,
              0,
              0.08
            );
        }

        .info {
          padding: 16px
            16px 10px;
        }

        .category {
          color: #777;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .name {
          min-height: 42px;
          margin: 7px 0;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 750;
        }

        .rating {
          color: #6d6d6d;
          font-size: 12px;
        }

        .stars {
          color: #171717;
          letter-spacing: 1px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 9px;
        }

        .price {
          font-size: 21px;
          font-weight: 900;
        }

        .old {
          color: #999;
          font-size: 12px;
          text-decoration: line-through;
        }

        .actions {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 8px;
          padding: 6px
            16px 16px;
        }

        .actions button {
          height: 42px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 900;
        }

        .add {
          border:
            1px solid #bdbdbd;
          background: white;
          color: #111;
        }

        .buy {
          border:
            1px solid #111;
          background: #111;
          color: white;
        }

        .add:hover {
          background: #f2f2f2;
        }

        .buy:hover {
          background: #333;
        }

        .promo {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 1px;
          margin-top: 42px;
          background: #dedede;
          border:
            1px solid #dedede;
          border-radius: 11px;
          overflow: hidden;
        }

        .promo-item {
          background: white;
          padding: 25px;
        }

        .promo-title {
          font-weight: 900;
          font-size: 14px;
        }

        .promo-text {
          margin-top: 6px;
          color: #777;
          font-size: 12px;
          line-height: 1.5;
        }

        .detail {
          background: white;
          border:
            1px solid #e3e3e3;
          border-radius: 12px;
          overflow: hidden;
        }

        .back {
          border: 0;
          background: transparent;
          padding: 0;
          margin-bottom: 17px;
          font-size: 13px;
          font-weight: 800;
        }

        .detail-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
        }

        .detail-photo {
          min-height: 650px;
          background: #f0f0ee;
        }

        .detail-photo img {
          width: 100%;
          height: 100%;
          min-height: 650px;
          object-fit: cover;
        }

        .detail-info {
          padding: 65px;
        }

        .detail-info h1 {
          margin: 11px 0 12px;
          font-size: 42px;
          line-height: 1.05;
          letter-spacing: -2px;
        }

        .detail-price {
          margin: 27px 0;
          font-size: 36px;
          font-weight: 900;
        }

        .description {
          padding: 24px 0;
          border-top:
            1px solid #e5e5e5;
          border-bottom:
            1px solid #e5e5e5;
          color: #555;
          line-height: 1.7;
          font-size: 14px;
        }

        .description p {
          margin-bottom: 0;
        }

        .detail-actions {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
          margin-top: 25px;
        }

        .detail-actions button {
          height: 52px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 900;
        }

        .cart-page {
          background: white;
          border:
            1px solid #e4e4e4;
          border-radius: 12px;
          padding: 30px;
        }

        .cart-page h1 {
          margin: 0 0 5px;
          font-size: 31px;
          letter-spacing: -1px;
        }

        .cart-item {
          display: flex;
          gap: 17px;
          padding: 20px 0;
          border-bottom:
            1px solid #e7e7e7;
        }

        .cart-item img {
          width: 110px;
          height: 110px;
          object-fit: cover;
          border-radius: 7px;
        }

        .cart-item-main {
          flex: 1;
        }

        .quantity {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }

        .quantity button {
          width: 30px;
          height: 30px;
          border:
            1px solid #d2d2d2;
          background: white;
          border-radius: 5px;
          font-weight: 900;
        }

        .remove {
          border: 0 !important;
          width: auto !important;
          background: transparent !important;
          color: #777;
          margin-left: 7px;
        }

        .summary {
          max-width: 400px;
          margin: 25px 0 0 auto;
        }

        .checkout {
          width: 100%;
          height: 50px;
          margin-top: 14px;
          border: 0;
          border-radius: 6px;
          background: #111;
          color: white;
          font-weight: 900;
        }

        .empty {
          padding: 80px 20px;
          text-align: center;
          color: #777;
        }

        .empty h2 {
          color: #111;
        }

        .supplier-status {
          margin: 0 0 18px;
          padding: 13px 15px;
          border:
            1px solid #e3e3e3;
          border-radius: 8px;
          background: white;
          color: #666;
          font-size: 13px;
        }

        .supplier-error {
          color: #8a1f1f;
        }

        footer {
          margin-top: 65px;
          background: #171717;
          color: white;
          padding: 50px 28px;
        }

        .footer-inner {
          max-width: 1440px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          gap: 30px;
        }

        .footer-copy {
          max-width: 500px;
          color: #aaa;
          line-height: 1.6;
          font-size: 13px;
        }

        @media (max-width: 1100px) {
          .header-links
            .header-link {
            display: none;
          }

          .products {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 760px) {
          .header-main {
            padding: 14px 16px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .brand {
            min-width: 120px;
          }

          .brand-name {
            font-size: 27px;
          }

          .search {
            order: 3;
            flex-basis: 100%;
            max-width: none;
          }

          .container {
            padding: 15px;
          }

          .hero {
            min-height: 330px;
            padding: 35px 25px;
          }

          .hero h1 {
            font-size: 43px;
            letter-spacing: -2.5px;
          }

          .hero-shape {
            opacity: 0.5;
          }

          .products {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
            gap: 10px;
          }

          .info {
            padding: 12px
              11px 7px;
          }

          .actions {
            padding: 5px
              11px 11px;
            gap: 5px;
          }

          .promo {
            grid-template-columns:
              1fr;
          }

          .detail-grid {
            grid-template-columns:
              1fr;
          }

          .detail-photo,
          .detail-photo
            img {
            min-height: 380px;
          }

          .detail-info {
            padding: 28px;
          }

          .detail-info h1 {
            font-size: 31px;
          }

          .cart-page {
            padding: 18px;
          }

          .cart-item {
            align-items: flex-start;
          }

          .cart-item img {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>

      <header className="header">
        <div className="header-main">
          <button
            className="brand"
            onClick={showHome}
          >
            <span className="brand-name">
              Marlow
            </span>

            <span className="brand-sub">
              Shop smarter
            </span>
          </button>

          <form
            className="search"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearchSubmit();
            }}
          >
            <input
              value={search}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value
                )
              }
              placeholder="Search products, brands and more..."
            />

            <button
              type="submit"
              aria-label="Search"
              disabled={
                searchingSupplier
              }
            >
              {searchingSupplier
                ? "…"
                : "⌕"}
            </button>
          </form>

          <div className="header-links">
            <button className="header-link">
              Account
            </button>

            <button className="header-link">
              Orders
            </button>

            <button
              className="cart"
              onClick={() => {
                setCartOpen(true);
                setProduct(null);
              }}
            >
              Cart{" "}
              <span>
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-inner">
            {categories.map(
              (item) => (
                <button
                  key={item}
                  className={
                    category === item
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setCategory(item);
                    setProduct(null);
                    setCartOpen(false);
                    setSearch("");
                    setSupplierProducts(
                      []
                    );
                    setSupplierError(
                      ""
                    );
                    setSupplierSearched(
                      false
                    );
                  }}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </nav>
      </header>

      <main className="container">
        {!product &&
          !cartOpen && (
            <>
              {!search &&
                category ===
                  "All" && (
                  <section className="hero">
                    <div className="hero-content">
                      <div className="hero-kicker">
                        Welcome to Marlow
                      </div>

                      <h1>
                        Shopping made
                        <br />
                        beautifully simple.
                      </h1>

                      <p>
                        Discover products
                        you'll love,
                        find what you're
                        looking for,
                        and shop
                        everything from
                        one place.
                      </p>

                      <button
                        className="hero-action"
                        onClick={() =>
                          document
                            .getElementById(
                              "featured"
                            )
                            ?.scrollIntoView(
                              {
                                behavior:
                                  "smooth",
                              }
                            )
                        }
                      >
                        Explore Products
                      </button>
                    </div>

                    <div className="hero-shape" />
                  </section>
                )}

              {search ? (
                <section
                  className="section"
                  id="search-results"
                >
                  <div className="section-head">
                    <div>
                      <h2>
                        Search results
                        for "
                        {search}"
                      </h2>

                      <p>
                        Products matching
                        your search
                      </p>
                    </div>

                    <span className="section-count">
                      {
                        filtered.length
                      }{" "}
                      products
                    </span>
                  </div>

                  {supplierError &&
                    supplierSearched && (
                      <div className="supplier-status supplier-error">
                        {
                          supplierError
                        }
                      </div>
                    )}

                  {!searchingSupplier &&
                    supplierSearched &&
                    filtered.length ===
                      0 &&
                    !supplierError && (
                      <div className="empty">
                        <h2>
                          No products found.
                        </h2>

                        <p>
                          CJ did not return
                          any usable products
                          for this search.
                        </p>
                      </div>
                    )}

                  {filtered.length >
                    0 && (
                    <div className="products">
                      {filtered.map(
                        (item) => (
                          <ProductCard
                            key={
                              item.id
                            }
                            item={item}
                            addToCart={
                              addToCart
                            }
                            buyNow={
                              buyNow
                            }
                            openProduct={
                              openProduct
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </section>
              ) : (
                <>
                  <div id="featured">
                    <ProductSection
                      title="Featured Products"
                      subtitle="Products selected to catch your eye"
                      products={
                        featuredProducts
                      }
                      addToCart={
                        addToCart
                      }
                      buyNow={buyNow}
                      openProduct={
                        openProduct
                      }
                    />
                  </div>

                  <ProductSection
                    title="Trending Now"
                    subtitle="Popular picks shoppers are checking out"
                    products={
                      trendingProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="More Products"
                    subtitle="Keep scrolling to discover more from Marlow"
                    products={
                      miscellaneousProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Electronics"
                    subtitle="Popular electronics and everyday technology"
                    products={
                      electronicsProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Clothing"
                    subtitle="Everyday fashion and apparel"
                    products={
                      clothingProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Beauty"
                    subtitle="Beauty, skincare, hair and personal care"
                    products={
                      beautyProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Sports"
                    subtitle="Gear and products for active lifestyles"
                    products={
                      sportsProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Toys"
                    subtitle="Fun products for kids and families"
                    products={
                      toysProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Travel"
                    subtitle="Travel gear and everyday accessories"
                    products={
                      travelProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Tools"
                    subtitle="Tools, hardware and useful equipment"
                    products={
                      toolsProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Home & Kitchen"
                    subtitle="Products to make your home better"
                    products={
                      homeCategoryProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  <ProductSection
                    title="Marlow Deals"
                    subtitle="Products with room for a great deal"
                    products={
                      dealProducts
                    }
                    addToCart={
                      addToCart
                    }
                    buyNow={buyNow}
                    openProduct={
                      openProduct
                    }
                  />

                  {loadingHomeProducts && (
                    <div className="supplier-status">
                      Loading Marlow's product
                      catalog...
                    </div>
                  )}

                  {homeError && (
                    <div className="supplier-status supplier-error">
                      {homeError}
                    </div>
                  )}

                  <section className="promo">
                    <div className="promo-item">
                      <div className="promo-title">
                        A growing marketplace
                      </div>

                      <div className="promo-text">
                        Marlow is designed
                        to grow into a large
                        product catalog
                        powered by connected
                        supplier inventory.
                      </div>
                    </div>

                    <div className="promo-item">
                      <div className="promo-title">
                        Discover more
                      </div>

                      <div className="promo-text">
                        Customers can browse
                        the homepage or search
                        CJ for additional
                        products.
                      </div>
                    </div>

                    <div className="promo-item">
                      <div className="promo-title">
                        Smart Marlow pricing
                      </div>

                      <div className="promo-text">
                        Supplier costs are
                        converted into
                        Marlow selling prices
                        automatically.
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}

        {product && (
          <>
            <button
              className="back"
              onClick={() =>
                setProduct(null)
              }
            >
              ← Back to shopping
            </button>

            <section className="detail">
              <div className="detail-grid">
                <div className="detail-photo">
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                </div>

                <div className="detail-info">
                  <div className="category">
                    {
                      product.category
                    }
                  </div>

                  <h1>
                    {product.name}
                  </h1>

                  <div className="rating">
                    <span className="stars">
                      ★★★★★
                    </span>{" "}
                    {
                      product.rating
                    }{" "}
                    ·{" "}
                    {product.reviews >
                    0
                      ? `${product.reviews.toLocaleString()} reviews`
                      : "Supplier catalog product"}
                  </div>

                  <div className="detail-price">
                    $
                    {Number(
                      product.price
                    ).toFixed(2)}
                  </div>

                  <div className="description">
                    <strong>
                      Product information
                    </strong>

                    <p>
                      {
                        product.description
                      }
                    </p>

                    {product.supplierCost >
                      0 && (
                      <p>
                        Marlow's automatic
                        pricing system
                        calculates the
                        selling price from
                        the supplier cost
                        while maintaining
                        at least $1 gross
                        profit.
                      </p>
                    )}
                  </div>

                  <div className="detail-actions">
                    <button
                      className="add"
                      onClick={() =>
                        addToCart(
                          product
                        )
                      }
                    >
                      Add to Cart
                    </button>

                    <button
                      className="buy"
                      onClick={() =>
                        buyNow(
                          product
                        )
                      }
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {cartOpen && (
          <>
            <button
              className="back"
              onClick={() =>
                setCartOpen(false)
              }
            >
              ← Continue Shopping
            </button>

            <section className="cart-page">
              <h1>
                Your Cart
              </h1>

              <p
                style={{
                  color: "#777",
                  marginTop: 5,
                }}
              >
                {cartCount}{" "}
                {cartCount ===
                1
                  ? "item"
                  : "items"}
              </p>

              {cart.length ===
              0 ? (
                <div className="empty">
                  <h2>
                    Your cart is
                    empty.
                  </h2>

                  <p>
                    Add something
                    you love and
                    it'll appear
                    here.
                  </p>
                </div>
              ) : (
                <>
                  {cart.map(
                    (item) => (
                      <div
                        className="cart-item"
                        key={
                          item.id
                        }
                      >
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                        />

                        <div className="cart-item-main">
                          <strong>
                            {
                              item.name
                            }
                          </strong>

                          <p
                            style={{
                              color:
                                "#777",
                              fontSize:
                                13,
                            }}
                          >
                            {
                              item.category
                            }
                          </p>

                          <strong>
                            $
                            {Number(
                              item.price
                            ).toFixed(
                              2
                            )}
                          </strong>

                          <div className="quantity">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  -1
                                )
                              }
                            >
                              −
                            </button>

                            <strong>
                              {
                                item.quantity
                              }
                            </strong>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  1
                                )
                              }
                            >
                              +
                            </button>

                            <button
                              className="remove"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  -item.quantity
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <strong>
                          $
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(
                            2
                          )}
                        </strong>
                      </div>
                    )
                  )}

                  <div className="summary">
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        fontSize: 18,
                      }}
                    >
                      <strong>
                        Subtotal
                      </strong>

                      <strong>
                        $
                        {cartTotal.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                    <button
                      className="checkout"
                      onClick={() =>
                        alert(
                          "Checkout will be connected to customer accounts, tax, shipping, secure payment processing, and automatic CJ order fulfillment in the next build stage."
                        )
                      }
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>

      <footer>
        <div className="footer-inner">
          <div>
            <div
              style={{
                fontSize: 27,
                fontWeight: 900,
              }}
            >
              Marlow
            </div>

            <div className="footer-copy">
              A modern shopping
              destination being
              built to make product
              discovery simple,
              convenient, and
              personal.
            </div>
          </div>

          <div
            style={{
              color: "#888",
              fontSize: 12,
              alignSelf: "end",
            }}
          >
            © 2026 Marlow
          </div>
        </div>
      </footer>
    </>
  );
}
