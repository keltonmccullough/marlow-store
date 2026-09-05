"use client";

import { useEffect, useMemo, useState } from "react";

const demoProducts = [
  {
    id: "demo-1",
    name: "Wireless Noise-Canceling Headphones",
    price: 39.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    description:
      "Wireless headphones with comfortable cushions and clear sound.",
  },
  {
    id: "demo-2",
    name: "Premium Smart Watch",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    description: "Modern smartwatch design for everyday use.",
  },
  {
    id: "demo-3",
    name: "Insulated Stainless Steel Bottle",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    description: "Reusable insulated bottle for home, work, or travel.",
  },
  {
    id: "demo-4",
    name: "Portable Wireless Speaker",
    price: 34.99,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    description: "Portable wireless speaker for music anywhere.",
  },
  {
    id: "demo-5",
    name: "Modern LED Desk Lamp",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    description: "Clean modern lighting for your desk or workspace.",
  },
  {
    id: "demo-6",
    name: "Everyday Travel Backpack",
    price: 44.99,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    category: "Travel",
    description: "Roomy backpack for everyday travel and commuting.",
  },
  {
    id: "demo-7",
    name: "Ultra Soft Home Throw",
    price: 32.99,
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    description: "Soft decorative throw blanket for your home.",
  },
  {
    id: "demo-8",
    name: "Kitchen Organization Collection",
    price: 27.99,
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    description: "Useful organization products for your kitchen.",
  },
];

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

const categorySearches = {
  Electronics: [
    "electronics",
    "phone accessories",
    "headphones",
    "earbuds",
    "smart watch",
    "computer accessories",
    "laptop accessories",
    "speakers",
    "chargers",
    "usb cable",
    "bluetooth",
    "gaming accessories",
  ],

  Home: [
    "home",
    "kitchen",
    "home decor",
    "storage",
    "lighting",
    "bedding",
    "bathroom",
    "organization",
    "furniture",
    "household",
  ],

  Clothing: [
    "clothing",
    "shirts",
    "t shirts",
    "pants",
    "jeans",
    "dresses",
    "hoodies",
    "jackets",
    "coats",
    "skirts",
    "sweaters",
    "shoes",
    "sneakers",
    "sandals",
    "boots",
    "bags",
  ],

  Beauty: [
    "beauty",
    "makeup",
    "skincare",
    "skin care",
    "hair care",
    "cosmetics",
    "grooming",
    "nail",
    "lipstick",
    "mascara",
    "serum",
  ],

  Sports: [
    "sports",
    "fitness",
    "exercise",
    "gym",
    "workout",
    "yoga",
    "football",
    "basketball",
    "soccer",
    "baseball",
    "camping",
    "hiking",
    "outdoor sports",
  ],

  Toys: [
    "toys",
    "kids toys",
    "children toys",
    "games",
    "puzzles",
    "RC toys",
    "remote control toys",
    "educational toys",
    "dolls",
    "building toys",
  ],

  Travel: [
    "travel",
    "luggage",
    "suitcase",
    "backpack",
    "travel bag",
    "travel accessories",
    "travel organizer",
    "passport holder",
    "packing organizer",
  ],

  Tools: [
    "tools",
    "hand tools",
    "hardware",
    "drill",
    "screwdriver",
    "wrench",
    "pliers",
    "hammer",
    "automotive tools",
    "repair tools",
    "tool accessories",
  ],
};

function getSupplierName(item) {
  return (
    item?.nameEn ||
    item?.name ||
    item?.productName ||
    item?.title ||
    "Marlow Product"
  );
}

function getSupplierImage(item) {
  return (
    item?.bigImage ||
    item?.image ||
    item?.imageUrl ||
    item?.productImage ||
    item?.skuImage ||
    ""
  );
}

function getSupplierCost(item) {
  const possiblePrices = [
    item?.nowPrice,
    item?.sellPrice,
    item?.discountPrice,
    item?.price,
  ];

  for (const value of possiblePrices) {
    const number = Number(value);

    if (Number.isFinite(number) && number > 0) {
      return number;
    }
  }

  return 0;
}

function calculateMarlowPrice(cost) {
  const number = Number(cost);

  if (!Number.isFinite(number) || number <= 0) {
    return 0;
  }

  let markup = 0.1;

  if (number < 10) {
    markup = 0.25;
  } else if (number < 25) {
    markup = 0.22;
  } else if (number < 50) {
    markup = 0.18;
  } else if (number < 100) {
    markup = 0.15;
  } else if (number < 200) {
    markup = 0.12;
  }

  return Number(
    Math.max(number * (1 + markup), number + 1).toFixed(2)
  );
}

function inferMarlowCategory(item) {
  const text = `
    ${item?.nameEn || ""}
    ${item?.name || ""}
    ${item?.productName || ""}
    ${item?.title || ""}
    ${item?.threeCategoryName || ""}
    ${item?.twoCategoryName || ""}
    ${item?.oneCategoryName || ""}
    ${item?.categoryName || ""}
    ${item?.description || ""}
  `.toLowerCase();

  if (
    /phone|iphone|android|charger|cable|headphone|earbud|speaker|computer|laptop|tablet|smartwatch|smart watch|camera|electronic|keyboard|mouse|usb|bluetooth|gaming console|monitor|projector/.test(
      text
    )
  ) {
    return "Electronics";
  }

  if (
    /dress|shirt|pants|jeans|hoodie|jacket|coat|clothing|clothes|skirt|sweater|socks|bra|underwear|shoe|sneaker|sandals|boots|footwear|fashion/.test(
      text
    )
  ) {
    return "Clothing";
  }

  if (
    /makeup|cosmetic|skincare|skin care|lipstick|mascara|foundation|serum|beauty|hair care|haircare|shampoo|conditioner|grooming|nail|eyelash|perfume/.test(
      text
    )
  ) {
    return "Beauty";
  }

  if (
    /fitness|gym|exercise|sport|sports|workout|yoga|football|basketball|soccer|baseball|camping|hiking|outdoor|running|cycling|weight/.test(
      text
    )
  ) {
    return "Sports";
  }

  if (
    /toy|toys|kids|children|puzzle|game|rc car|remote control|educational|doll|lego|building block|stuffed animal/.test(
      text
    )
  ) {
    return "Toys";
  }

  if (
    /travel|luggage|suitcase|backpack|passport|travel bag|organizer|camping bag|packing/.test(
      text
    )
  ) {
    return "Travel";
  }

  if (
    /tool|hardware|drill|screwdriver|wrench|pliers|hammer|automotive|repair|workshop|socket|ratchet/.test(
      text
    )
  ) {
    return "Tools";
  }

  if (
    /home|kitchen|bathroom|storage|lamp|lighting|decor|bedding|blanket|pillow|furniture|organizer|household|cookware|utensil/.test(
      text
    )
  ) {
    return "Home";
  }

  return "Home";
}

function getSearchIntent(query) {
  const q = String(query || "").toLowerCase();

  if (
    /cheap|cheapest|low price|low priced|budget|affordable|inexpensive|under \$|under dollar/.test(
      q
    )
  ) {
    return "cheap";
  }

  if (
    /expensive|highest price|high price|premium|luxury|most expensive/.test(
      q
    )
  ) {
    return "expensive";
  }

  if (
    /deal|deals|discount|sale|clearance|bargain|on sale/.test(q)
  ) {
    return "deals";
  }

  return "relevance";
}

function getSearchKeywords(query) {
  const q = String(query || "").toLowerCase().trim();

  if (!q) {
    return [];
  }

  const keywordMap = {
    electronics: [
      "electronics",
      "phone",
      "charger",
      "cable",
      "headphone",
      "earbud",
      "speaker",
      "computer",
      "laptop",
      "tablet",
      "watch",
      "camera",
      "keyboard",
      "mouse",
      "bluetooth",
    ],

    "phone accessories": [
      "phone",
      "iphone",
      "android",
      "charger",
      "case",
      "cable",
      "screen protector",
      "phone stand",
      "phone holder",
      "power bank",
    ],

    shoes: [
      "shoe",
      "shoes",
      "sneaker",
      "sneakers",
      "boot",
      "boots",
      "sandal",
      "sandals",
      "footwear",
      "slipper",
    ],

    clothing: [
      "clothing",
      "shirt",
      "shirts",
      "pants",
      "jeans",
      "dress",
      "dresses",
      "hoodie",
      "jacket",
      "coat",
      "skirt",
      "sweater",
      "shoe",
      "shoes",
    ],

    "womens clothing": [
      "women",
      "women's",
      "dress",
      "skirt",
      "blouse",
      "top",
      "leggings",
      "women shoes",
      "fashion",
    ],

    "mens clothing": [
      "men",
      "men's",
      "shirt",
      "pants",
      "jeans",
      "hoodie",
      "jacket",
      "men shoes",
      "fashion",
    ],

    beauty: [
      "beauty",
      "makeup",
      "cosmetic",
      "skincare",
      "skin care",
      "hair",
      "shampoo",
      "conditioner",
      "grooming",
      "nail",
    ],

    fitness: [
      "fitness",
      "gym",
      "exercise",
      "workout",
      "sports",
      "yoga",
      "running",
      "weights",
      "camping",
      "outdoor",
    ],

    travel: [
      "travel",
      "luggage",
      "suitcase",
      "backpack",
      "travel bag",
      "passport",
      "organizer",
    ],

    kids: [
      "kids",
      "children",
      "toy",
      "toys",
      "game",
      "puzzle",
      "doll",
      "educational",
    ],

    home: [
      "home",
      "kitchen",
      "bathroom",
      "decor",
      "storage",
      "lighting",
      "bedding",
      "furniture",
      "organizer",
    ],

    gifts: [
      "gift",
      "gifts",
      "present",
      "birthday",
      "christmas",
      "holiday",
    ],
  };

  if (keywordMap[q]) {
    return keywordMap[q];
  }

  return [q];
}

function productMatchesQuery(product, query) {
  const q = String(query || "").toLowerCase().trim();

  if (!q) {
    return true;
  }

  const expanded = getSearchKeywords(q);

  const text = `
    ${product?.name || ""}
    ${product?.category || ""}
    ${product?.description || ""}
    ${product?.subcategory || ""}
  `.toLowerCase();

  if (q.includes("shoe")) {
    return /shoe|sneaker|boot|sandal|footwear|slipper/.test(text);
  }

  if (q.includes("electronic")) {
    return product.category === "Electronics";
  }

  return expanded.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );
}

function convertSupplierProduct(item, index = 0) {
  const cost = getSupplierCost(item);
  const category = inferMarlowCategory(item);

  return {
    id:
      item?.id ||
      item?.productId ||
      item?.pid ||
      item?.sku ||
      `live-${Date.now()}-${index}`,

    name: getSupplierName(item),

    price: calculateMarlowPrice(cost),

    cost,

    image: getSupplierImage(item),

    category,

    subcategory:
      item?.threeCategoryName ||
      item?.twoCategoryName ||
      item?.oneCategoryName ||
      "",

    description:
      typeof item?.description === "string"
        ? item.description.replace(/<[^>]*>/g, "").trim()
        : "A great product selected for the Marlow collection.",

    sku: item?.sku || "",

    sourceId:
      item?.id ||
      item?.productId ||
      "",

    discountPrice:
      item?.discountPrice ||
      item?.nowPrice ||
      0,
  };
}

function sortProducts(products, intent) {
  const copy = [...products];

  if (intent === "cheap") {
    return copy.sort((a, b) => a.price - b.price);
  }

  if (intent === "expensive") {
    return copy.sort((a, b) => b.price - a.price);
  }

  if (intent === "deals") {
    return copy.sort((a, b) => {
      const aDiscount = Number(a?.discountPrice || 0);
      const bDiscount = Number(b?.discountPrice || 0);

      return bDiscount - aDiscount;
    });
  }

  return copy;
}

function ProductCard({ product, onOpen }) {
  return (
    <button
      className="product-card"
      onClick={() => onOpen(product)}
      type="button"
    >
      <div className="product-image-wrap">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="image-placeholder">M</div>
        )}
      </div>

      <div className="product-info">
        <div className="product-category">
          {product.category}
        </div>

        <h3>{product.name}</h3>

        <p>{product.description}</p>

        <div className="product-bottom">
          <strong>
            ${Number(product.price || 0).toFixed(2)}
          </strong>

          <span className="view-product">View</span>
        </div>
      </div>
    </button>
  );
}

function ProductSection({
  title,
  products,
  onOpen,
  onSeeAll,
  emptyText = "More products coming soon.",
}) {
  return (
    <section className="product-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MARLOW COLLECTION</p>
          <h2>{title}</h2>
        </div>

        {products.length > 0 && onSeeAll ? (
          <button
            className="see-all"
            type="button"
            onClick={onSeeAll}
          >
            See all
          </button>
        ) : null}
      </div>

      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <div className="empty-section">
          {emptyText}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [product, setProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const [supplierProducts, setSupplierProducts] = useState([]);
  const [homeProducts, setHomeProducts] = useState([]);

  const [searchingSupplier, setSearchingSupplier] =
    useState(false);

  const [loadingHomeProducts, setLoadingHomeProducts] =
    useState(false);

  const [supplierError, setSupplierError] =
    useState("");

  const [homeError, setHomeError] = useState("");

  const [hasSearched, setHasSearched] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [loadingCategory, setLoadingCategory] =
    useState(false);

  const [categoryProducts, setCategoryProducts] =
    useState([]);

  const [searchPage, setSearchPage] = useState(1);

  const [canLoadMore, setCanLoadMore] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function fetchProducts(query, page = 1) {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(
        query
      )}&page=${page}&size=100`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Product search failed.");
    }

    const data = await response.json();

    return {
      products: Array.isArray(data?.products)
        ? data.products
        : [],
      totalRecords: Number(data?.totalRecords || 0),
    };
  }

  async function searchSupplierCatalog(
    query,
    page = 1,
    append = false
  ) {
    const cleanQuery = String(query || "").trim();

    if (!cleanQuery) {
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setSearchingSupplier(true);
      setSupplierError("");
      setHasSearched(false);
    }

    try {
      const result = await fetchProducts(
        cleanQuery,
        page
      );

      let converted = result.products
        .map((item, index) =>
          convertSupplierProduct(item, index)
        )
        .filter(
          (item) =>
            item.name &&
            item.price > 0 &&
            item.id
        );

      const intent = getSearchIntent(cleanQuery);

      const lowered = cleanQuery.toLowerCase();

      if (
        lowered.includes("shoe") ||
        lowered.includes("sneaker") ||
        lowered.includes("footwear")
      ) {
        converted = converted.filter((item) =>
          /shoe|sneaker|boot|sandal|footwear|slipper/i.test(
            `${item.name} ${item.description} ${item.subcategory}`
          )
        );
      }

      if (
        lowered.includes("electronics") ||
        lowered === "electronic"
      ) {
        converted = converted.filter(
          (item) =>
            item.category === "Electronics"
        );
      }

      if (
        lowered.includes("beauty")
      ) {
        converted = converted.filter(
          (item) =>
            item.category === "Beauty"
        );
      }

      if (
        lowered.includes("travel")
      ) {
        converted = converted.filter(
          (item) =>
            item.category === "Travel"
        );
      }

      if (
        lowered.includes("sports") ||
        lowered.includes("fitness")
      ) {
        converted = converted.filter(
          (item) =>
            item.category === "Sports"
        );
      }

      if (
        lowered.includes("toys") ||
        lowered.includes("kids")
      ) {
        converted = converted.filter(
          (item) =>
            item.category === "Toys"
        );
      }

      if (
        lowered.includes("tools") ||
        lowered.includes("tool")
      ) {
        converted = converted.filter(
          (item) =>
            item.category === "Tools"
        );
      }

      if (
        lowered.includes("home") ||
        lowered.includes("kitchen")
      ) {
        converted = converted.filter(
          (item) =>
            item.category === "Home"
        );
      }

      if (
        lowered.includes("clothing") ||
        lowered.includes("clothes") ||
        lowered.includes("shirt") ||
        lowered.includes("pants") ||
        lowered.includes("dress")
      ) {
        converted = converted.filter(
          (item) =>
            item.category === "Clothing"
        );
      }

      if (lowered.includes("cheap")) {
        converted = converted.filter(
          (item) => item.price > 0
        );
      }

      converted = sortProducts(
        converted,
        intent
      );

      if (append) {
        setSupplierProducts((current) => {
          const map = new Map(
            current.map((item) => [
              item.id,
              item,
            ])
          );

          converted.forEach((item) => {
            if (!map.has(item.id)) {
              map.set(item.id, item);
            }
          });

          return sortProducts(
            Array.from(map.values()),
            intent
          );
        });
      } else {
        setSupplierProducts(converted);
      }

      setSearchPage(page);

      setCanLoadMore(
        result.totalRecords > page * 100
      );

      setHasSearched(true);
    } catch (error) {
      console.error(error);

      if (!append) {
        setSupplierProducts([]);
      }

      setSupplierError(
        "We couldn't load those products right now. Please try again."
      );

      setHasSearched(true);
    } finally {
      setSearchingSupplier(false);
      setLoadingMore(false);
    }
  }

  async function loadHomeProducts() {
    setLoadingHomeProducts(true);
    setHomeError("");

    const homeSearches = [
      "electronics",
      "phone accessories",
      "headphones",
      "smart watch",
      "home kitchen",
      "home decor",
      "storage",
      "lighting",
      "clothing",
      "shoes",
      "beauty",
      "skincare",
      "fitness sports",
      "toys",
      "travel",
      "luggage",
      "tools",
    ];

    try {
      const results = await Promise.all(
        homeSearches.map(async (query) => {
          try {
            const result =
              await fetchProducts(query, 1);

            return result.products.map(
              (item, index) =>
                convertSupplierProduct(
                  item,
                  index
                )
            );
          } catch {
            return [];
          }
        })
      );

      const map = new Map();

      results.flat().forEach((item) => {
        if (
          item?.id &&
          item?.name &&
          item?.price > 0 &&
          !map.has(item.id)
        ) {
          map.set(item.id, item);
        }
      });

      const liveProducts =
        Array.from(map.values());

      const combined = [...liveProducts];

      for (const demo of demoProducts) {
        if (combined.length >= 150) {
          break;
        }

        if (
          !combined.some(
            (item) => item.id === demo.id
          )
        ) {
          combined.push(demo);
        }
      }

      setHomeProducts(
        combined.slice(0, 150)
      );

      if (liveProducts.length === 0) {
        setHomeError(
          "Live products are temporarily unavailable. Showing Marlow's featured collection."
        );
      }
    } catch (error) {
      console.error(error);

      setHomeProducts(demoProducts);

      setHomeError(
        "Live products are temporarily unavailable. Showing Marlow's featured collection."
      );
    } finally {
      setLoadingHomeProducts(false);
    }
  }

  async function loadCategoryProducts(
    selectedCategory
  ) {
    if (selectedCategory === "All") {
      setCategoryProducts([]);
      return;
    }

    const searches =
      categorySearches[selectedCategory] || [
        selectedCategory,
      ];

    setLoadingCategory(true);
    setSupplierError("");

    try {
      const results = await Promise.all(
        searches.map(async (query) => {
          try {
            const result =
              await fetchProducts(query, 1);

            return result.products.map(
              (item, index) =>
                convertSupplierProduct(
                  item,
                  index
                )
            );
          } catch {
            return [];
          }
        })
      );

      const map = new Map();

      results.flat().forEach((item) => {
        if (
          item?.id &&
          item?.name &&
          item?.price > 0 &&
          item.category ===
            selectedCategory &&
          !map.has(item.id)
        ) {
          map.set(item.id, item);
        }
      });

      let products =
        Array.from(map.values());

      if (products.length === 0) {
        products =
          demoProducts.filter(
            (item) =>
              item.category ===
              selectedCategory
          );
      }

      setCategoryProducts(products);
    } catch (error) {
      console.error(error);

      setCategoryProducts(
        demoProducts.filter(
          (item) =>
            item.category ===
            selectedCategory
        )
      );
    } finally {
      setLoadingCategory(false);
    }
  }

  useEffect(() => {
    loadHomeProducts();
  }, []);

  useEffect(() => {
    if (category !== "All") {
      loadCategoryProducts(category);
    } else {
      setCategoryProducts([]);
    }
  }, [category]);

  function handleSearchSubmit(event) {
    event?.preventDefault();

    const cleanQuery =
      search.trim();

    if (!cleanQuery) {
      return;
    }

    setCategory("All");
    setSearchQuery(cleanQuery);
    setSearchPage(1);
    setCanLoadMore(false);

    searchSupplierCatalog(
      cleanQuery,
      1,
      false
    );
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  function handleCategoryClick(
    selectedCategory
  ) {
    setCategory(selectedCategory);
    setSearch("");

    if (selectedCategory === "All") {
      setSearchQuery("");
      setHasSearched(false);
      setSupplierProducts([]);
    } else {
      setHasSearched(false);
      setSupplierProducts([]);
    }
  }

  function loadMoreSearchResults() {
    if (
      !searchQuery ||
      loadingMore ||
      !canLoadMore
    ) {
      return;
    }

    searchSupplierCatalog(
      searchQuery,
      searchPage + 1,
      true
    );
  }

  function openProduct(item) {
    setProduct(item);
  }

  function addToCart(item) {
    setCart((current) => {
      const existing =
        current.find(
          (cartItem) =>
            cartItem.id === item.id
        );

      if (existing) {
        return current.map(
          (cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity + 1,
                }
              : cartItem
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

    setProduct(null);
    setCartOpen(true);
  }

  function increaseQuantity(id) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  function showHome() {
    setCategory("All");
    setSearch("");
    setSearchQuery("");
    setSupplierProducts([]);
    setHasSearched(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const visibleProducts =
    useMemo(() => {
      if (category !== "All") {
        return categoryProducts;
      }

      if (hasSearched) {
        return supplierProducts;
      }

      return homeProducts;
    }, [
      category,
      categoryProducts,
      hasSearched,
      supplierProducts,
      homeProducts,
    ]);

  const featuredProducts =
    homeProducts.slice(0, 8);

  const trendingProducts =
    homeProducts.slice(8, 16);

  const electronicsProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Electronics"
      )
      .slice(0, 8);

  const homeKitchenProducts =
    homeProducts
      .filter(
        (item) =>
          item.category ===
          "Home"
      )
      .slice(0, 8);

  const dealProducts =
    [...homeProducts]
      .sort(
        (a, b) =>
          a.price - b.price
      )
      .slice(0, 8);

  const showSearchResults =
    hasSearched &&
    category === "All";

  const showCategoryResults =
    category !== "All";

  return (
    <main>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f7f5f0;
          color: #171717;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .marlow-page {
          min-height: 100vh;
        }

        .topbar {
          background: #171717;
          color: white;
          padding: 10px 20px;
          text-align: center;
          font-size: 13px;
          letter-spacing: 0.04em;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(
            247,
            245,
            240,
            0.96
          );
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e5e0d6;
        }

        .header-inner {
          max-width: 1400px;
          margin: auto;
          min-height: 78px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .logo {
          border: 0;
          background: transparent;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.07em;
          color: #171717;
        }

        .search-form {
          flex: 1;
          display: flex;
          max-width: 720px;
          margin: 0 auto;
        }

        .search-input {
          width: 100%;
          height: 46px;
          border: 1px solid #d9d3c8;
          background: white;
          border-radius: 14px 0 0 14px;
          padding: 0 16px;
          outline: none;
        }

        .search-input:focus {
          border-color: #171717;
        }

        .search-button {
          height: 46px;
          padding: 0 20px;
          border: 0;
          background: #171717;
          color: white;
          border-radius: 0 14px 14px 0;
          font-weight: 800;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-action {
          border: 1px solid #ded8ce;
          background: white;
          border-radius: 12px;
          padding: 10px 13px;
          font-weight: 700;
        }

        .cart-button {
          position: relative;
          border: 0;
          background: #171717;
          color: white;
          border-radius: 12px;
          padding: 11px 15px;
          font-weight: 800;
        }

        .cart-count {
          position: absolute;
          top: -7px;
          right: -7px;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          border-radius: 999px;
          background: #d94841;
          color: white;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-bar {
          border-top: 1px solid #ebe6dc;
          border-bottom: 1px solid #e5e0d6;
          background: #fbfaf7;
          overflow-x: auto;
        }

        .category-inner {
          max-width: 1400px;
          margin: auto;
          padding: 0 24px;
          display: flex;
          gap: 8px;
          min-height: 52px;
          align-items: center;
        }

        .category-button {
          border: 0;
          background: transparent;
          padding: 9px 14px;
          border-radius: 999px;
          white-space: nowrap;
          color: #5e5a53;
          font-weight: 700;
        }

        .category-button.active {
          background: #171717;
          color: white;
        }

        .hero {
          max-width: 1400px;
          margin: 0 auto;
          padding: 42px 24px 20px;
        }

        .hero-box {
          min-height: 410px;
          border-radius: 28px;
          background: #ded8cb;
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
        }

        .hero-content {
          max-width: 650px;
          padding: 55px;
          position: relative;
          z-index: 2;
        }

        .eyebrow {
          margin: 0 0 9px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.16em;
          color: #777168;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(
            42px,
            6vw,
            76px
          );
          line-height: 0.94;
          letter-spacing: -0.065em;
        }

        .hero p {
          max-width: 570px;
          font-size: 18px;
          line-height: 1.6;
          color: #555047;
          margin: 24px 0;
        }

        .hero-button {
          border: 0;
          border-radius: 13px;
          background: #171717;
          color: white;
          padding: 14px 21px;
          font-weight: 900;
        }

        .hero-decoration {
          position: absolute;
          right: -80px;
          bottom: -130px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.35
          );
        }

        .content {
          max-width: 1400px;
          margin: auto;
          padding: 20px 24px 80px;
        }

        .product-section {
          margin-top: 42px;
        }

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 17px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 31px;
          letter-spacing: -0.045em;
        }

        .see-all {
          border: 1px solid #d8d2c7;
          background: white;
          border-radius: 11px;
          padding: 9px 13px;
          font-weight: 800;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 16px;
        }

        .product-card {
          text-align: left;
          padding: 0;
          border: 1px solid #e5e0d6;
          background: white;
          border-radius: 18px;
          overflow: hidden;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 35px
              rgba(
                20,
                20,
                20,
                0.09
              );
        }

        .product-image-wrap {
          aspect-ratio: 1 / 1;
          background: #eeeae2;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          font-weight: 900;
          color: #aaa39a;
        }

        .product-info {
          padding: 15px;
        }

        .product-category {
          color: #80786e;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .product-info h3 {
          margin: 7px 0 7px;
          font-size: 16px;
          line-height: 1.25;
          min-height: 40px;
        }

        .product-info p {
          margin: 0;
          color: #716c65;
          font-size: 13px;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 38px;
        }

        .product-bottom {
          margin-top: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .product-bottom strong {
          font-size: 18px;
        }

        .view-product {
          color: #777168;
          font-size: 12px;
          font-weight: 900;
        }

        .loading-box,
        .empty-section,
        .error-box {
          background: white;
          border: 1px solid #e5e0d6;
          border-radius: 17px;
          padding: 30px;
          text-align: center;
          color: #716c65;
        }

        .error-box {
          color: #8a3f3a;
        }

        .load-more-wrap {
          display: flex;
          justify-content: center;
          margin-top: 28px;
        }

        .load-more-button {
          border: 0;
          background: #171717;
          color: white;
          border-radius: 13px;
          padding: 13px 21px;
          font-weight: 900;
        }

        .footer {
          background: #171717;
          color: white;
          margin-top: 60px;
        }

        .footer-inner {
          max-width: 1400px;
          margin: auto;
          padding: 45px 24px;
          display: flex;
          justify-content: space-between;
          gap: 30px;
        }

        .footer h2 {
          margin: 0 0 8px;
        }

        .footer p {
          margin: 0;
          color: #bdb8b0;
        }

        .footer-links {
          display: flex;
          gap: 25px;
          color: #d8d3cb;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(
            0,
            0,
            0,
            0.48
          );
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          width: min(
            850px,
            100%
          );
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 24px;
          position: relative;
        }

        .modal-close {
          position: absolute;
          right: 15px;
          top: 15px;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #171717;
          color: white;
          font-size: 20px;
          z-index: 3;
        }

        .product-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .detail-image {
          min-height: 480px;
          background: #eeeae2;
        }

        .detail-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .detail-content {
          padding: 45px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .detail-content h2 {
          font-size: 38px;
          line-height: 1;
          letter-spacing: -0.05em;
          margin: 8px 0 15px;
        }

        .detail-price {
          font-size: 27px;
          font-weight: 900;
          margin-bottom: 20px;
        }

        .detail-description {
          color: #66615a;
          line-height: 1.65;
        }

        .add-button {
          margin-top: 25px;
          border: 0;
          background: #171717;
          color: white;
          padding: 15px 20px;
          border-radius: 13px;
          font-weight: 900;
        }

        .cart-drawer {
          margin-left: auto;
          height: 100%;
          width: min(
            470px,
            100%
          );
          background: white;
          padding: 25px;
          overflow-y: auto;
        }

        .cart-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .cart-heading h2 {
          margin: 0;
        }

        .cart-close {
          border: 0;
          background: #eeeae2;
          width: 38px;
          height: 38px;
          border-radius: 50%;
        }

        .cart-item {
          display: grid;
          grid-template-columns:
            75px 1fr auto;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid
            #eeeae2;
        }

        .cart-item img {
          width: 75px;
          height: 75px;
          border-radius: 10px;
          object-fit: cover;
          background: #eeeae2;
        }

        .cart-item h3 {
          margin: 0 0 6px;
          font-size: 14px;
        }

        .cart-item-price {
          font-weight: 900;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 9px;
        }

        .quantity-controls button {
          width: 27px;
          height: 27px;
          border: 1px solid #ddd7cd;
          background: white;
          border-radius: 7px;
        }

        .remove-button {
          border: 0;
          background: transparent;
          color: #9a4c45;
          font-size: 12px;
          padding: 0;
          margin-top: 7px;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          font-weight: 900;
          margin-top: 25px;
        }

        .checkout-button {
          width: 100%;
          margin-top: 17px;
          border: 0;
          background: #171717;
          color: white;
          padding: 15px;
          border-radius: 13px;
          font-weight: 900;
        }

        .empty-cart {
          text-align: center;
          color: #777168;
          padding: 60px 20px;
        }

        @media (max-width: 1000px) {
          .product-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }

          .header-inner {
            flex-wrap: wrap;
            padding-top: 12px;
            padding-bottom: 12px;
          }

          .search-form {
            order: 3;
            flex-basis: 100%;
            max-width: none;
          }
        }

        @media (max-width: 720px) {
          .header-actions {
            margin-left: auto;
          }

          .header-action {
            display: none;
          }

          .hero-box {
            min-height: 420px;
          }

          .hero-content {
            padding: 32px;
          }

          .product-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 11px;
          }

          .product-info {
            padding: 11px;
          }

          .product-info h3 {
            font-size: 14px;
          }

          .product-info p {
            font-size: 12px;
          }

          .product-bottom strong {
            font-size: 16px;
          }

          .product-detail {
            grid-template-columns: 1fr;
          }

          .detail-image {
            min-height: 330px;
          }

          .detail-content {
            padding: 28px;
          }

          .footer-inner {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="marlow-page">
        <div className="topbar">
          FREE SHIPPING OPTIONS AVAILABLE ON SELECT PRODUCTS
        </div>

        <header className="header">
          <div className="header-inner">
            <button
              type="button"
              className="logo"
              onClick={showHome}
            >
              MARLOW
            </button>

            <form
              className="search-form"
              onSubmit={
                handleSearchSubmit
              }
            >
              <input
                className="search-input"
                value={search}
                onChange={
                  handleSearchChange
                }
                placeholder="Search products, categories, shoes, electronics..."
                aria-label="Search products"
              />

              <button
                className="search-button"
                type="submit"
              >
                Search
              </button>
            </form>

            <div className="header-actions">
              <button
                className="header-action"
                type="button"
                onClick={() =>
                  alert(
                    "Customer accounts will be connected in the secure checkout stage."
                  )
                }
              >
                Account
              </button>

              <button
                className="header-action"
                type="button"
                onClick={() =>
                  alert(
                    "Order history will be available after customer accounts are connected."
                  )
                }
              >
                Orders
              </button>

              <button
                className="cart-button"
                type="button"
                onClick={() =>
                  setCartOpen(true)
                }
              >
                Cart

                {cartCount > 0 ? (
                  <span className="cart-count">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <nav className="category-bar">
            <div className="category-inner">
              {categories.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={`category-button ${
                      category ===
                      item
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleCategoryClick(
                        item
                      )
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </nav>
        </header>

        {!showSearchResults &&
        !showCategoryResults ? (
          <section className="hero">
            <div className="hero-box">
              <div className="hero-content">
                <p className="eyebrow">
                  WELCOME TO MARLOW
                </p>

                <h1>
                  Shop more.
                  <br />
                  Find your style.
                </h1>

                <p>
                  Discover electronics,
                  home essentials,
                  clothing, beauty,
                  sports, toys, travel
                  products, tools, and
                  more—all in one
                  place.
                </p>

                <button
                  type="button"
                  className="hero-button"
                  onClick={() =>
                    document
                      .getElementById(
                        "featured"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      })
                  }
                >
                  Shop the collection
                </button>
              </div>

              <div className="hero-decoration" />
            </div>
          </section>
        ) : null}

        <div className="content">
          {showSearchResults ? (
            <section className="product-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    SEARCH RESULTS
                  </p>

                  <h2>
                    Results for "
                    {searchQuery}"
                  </h2>
                </div>
              </div>

              {searchingSupplier ? (
                <div className="loading-box">
                  Finding products...
                </div>
              ) : supplierError ? (
                <div className="error-box">
                  {supplierError}
                </div>
              ) : visibleProducts.length >
                0 ? (
                <>
                  <div className="product-grid">
                    {visibleProducts.map(
                      (item) => (
                        <ProductCard
                          key={
                            item.id
                          }
                          product={
                            item
                          }
                          onOpen={
                            openProduct
                          }
                        />
                      )
                    )}
                  </div>

                  {canLoadMore ? (
                    <div className="load-more-wrap">
                      <button
                        type="button"
                        className="load-more-button"
                        onClick={
                          loadMoreSearchResults
                        }
                        disabled={
                          loadingMore
                        }
                      >
                        {loadingMore
                          ? "Loading more..."
                          : "Load more products"}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : hasSearched ? (
                <div className="empty-section">
                  No products match
                  that search.
                </div>
              ) : null}
            </section>
          ) : null}

          {showCategoryResults ? (
            <section className="product-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    MARLOW CATEGORY
                  </p>

                  <h2>
                    {category}
                  </h2>
                </div>
              </div>

              {loadingCategory ? (
                <div className="loading-box">
                  Finding products in{" "}
                  {category}...
                </div>
              ) : categoryProducts.length >
                0 ? (
                <div className="product-grid">
                  {categoryProducts.map(
                    (item) => (
                      <ProductCard
                        key={
                          item.id
                        }
                        product={
                          item
                        }
                        onOpen={
                          openProduct
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="empty-section">
                  More{" "}
                  {category.toLowerCase()}{" "}
                  products will be
                  added soon.
                </div>
              )}
            </section>
          ) : null}

          {!showSearchResults &&
          !showCategoryResults ? (
            <>
              {homeError ? (
                <div className="error-box">
                  {homeError}
                </div>
              ) : null}

              {loadingHomeProducts ? (
                <div className="loading-box">
                  Loading Marlow's
                  collection...
                </div>
              ) : null}

              <div id="featured">
                <ProductSection
                  title="Featured Products"
                  products={
                    featuredProducts
                  }
                  onOpen={
                    openProduct
                  }
                  onSeeAll={() =>
                    window.scrollTo(
                      {
                        top:
                          document
                            .body
                            .scrollHeight,
                        behavior:
                          "smooth",
                      }
                    )
                  }
                />
              </div>

              <ProductSection
                title="Trending Now"
                products={
                  trendingProducts
                }
                onOpen={
                  openProduct
                }
                onSeeAll={() =>
                  document
                    .getElementById(
                      "featured"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
              />

              <ProductSection
                title="Electronics"
                products={
                  electronicsProducts
                }
                onOpen={
                  openProduct
                }
                onSeeAll={() =>
                  handleCategoryClick(
                    "Electronics"
                  )
                }
              />

              <ProductSection
                title="Home & Kitchen"
                products={
                  homeKitchenProducts
                }
                onOpen={
                  openProduct
                }
                onSeeAll={() =>
                  handleCategoryClick(
                    "Home"
                  )
                }
              />

              <ProductSection
                title="Marlow Deals"
                products={
                  dealProducts
                }
                onOpen={
                  openProduct
                }
              />
            </>
          ) : null}
        </div>

        <footer className="footer">
          <div className="footer-inner">
            <div>
              <h2>MARLOW</h2>

              <p>
                A simple place to
                discover products
                you love.
              </p>
            </div>

            <div className="footer-links">
              <span>Shop</span>
              <span>Help</span>
              <span>About</span>
            </div>
          </div>
        </footer>

        {product ? (
          <div
            className="overlay"
            onClick={() =>
              setProduct(null)
            }
          >
            <div
              className="modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setProduct(null)
                }
              >
                ×
              </button>

              <div className="product-detail">
                <div className="detail-image">
                  {product.image ? (
                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                    />
                  ) : (
                    <div className="image-placeholder">
                      M
                    </div>
                  )}
                </div>

                <div className="detail-content">
                  <p className="eyebrow">
                    {
                      product.category
                    }
                  </p>

                  <h2>
                    {
                      product.name
                    }
                  </h2>

                  <div className="detail-price">
                    $
                    {Number(
                      product.price ||
                        0
                    ).toFixed(2)}
                  </div>

                  <p className="detail-description">
                    {
                      product.description
                    }
                  </p>

                  <button
                    type="button"
                    className="add-button"
                    onClick={() =>
                      addToCart(
                        product
                      )
                    }
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {cartOpen ? (
          <div
            className="overlay"
            onClick={() =>
              setCartOpen(false)
            }
          >
            <aside
              className="cart-drawer"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="cart-heading">
                <h2>
                  Your Cart
                </h2>

                <button
                  type="button"
                  className="cart-close"
                  onClick={() =>
                    setCartOpen(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              {cart.length ===
              0 ? (
                <div className="empty-cart">
                  Your cart is
                  empty.
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
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                          />
                        ) : (
                          <div className="image-placeholder">
                            M
                          </div>
                        )}

                        <div>
                          <h3>
                            {
                              item.name
                            }
                          </h3>

                          <div className="cart-item-price">
                            $
                            {Number(
                              item.price ||
                                0
                            ).toFixed(
                              2
                            )}
                          </div>

                          <div className="quantity-controls">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="remove-button"
                            onClick={() =>
                              removeFromCart(
                                item.id
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>

                        <strong>
                          $
                          {Number(
                            item.price *
                              item.quantity
                          ).toFixed(
                            2
                          )}
                        </strong>
                      </div>
                    )
                  )}

                  <div className="cart-total">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      $
                      {cartTotal.toFixed(
                        2
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="checkout-button"
                    onClick={() =>
                      alert(
                        "Checkout will be available after customer accounts, tax, shipping, and secure payments are connected."
                      )
                    }
                  >
                    Checkout
                  </button>
                </>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}
