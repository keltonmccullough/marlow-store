"use client";

import { useMemo, useState } from "react";

const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 39.99,
    oldPrice: 59.99,
    category: "Electronics",
    rating: 4.8,
    reviews: 1247,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    description:
      "Premium wireless headphones with comfortable ear cushions, clear sound, and long-lasting battery life.",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 49.99,
    oldPrice: 79.99,
    category: "Electronics",
    rating: 4.7,
    reviews: 892,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    description:
      "A modern smartwatch for everyday activity tracking, notifications, and staying connected.",
  },
  {
    id: 3,
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    oldPrice: 34.99,
    category: "Home & Kitchen",
    rating: 4.9,
    reviews: 2156,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
    description:
      "Durable reusable stainless steel bottle designed to keep beverages cold or hot.",
  },
  {
    id: 4,
    name: "Portable Bluetooth Speaker",
    price: 34.99,
    oldPrice: 49.99,
    category: "Electronics",
    rating: 4.6,
    reviews: 734,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
    description:
      "Portable wireless speaker with rich sound and a compact design for home or travel.",
  },
  {
    id: 5,
    name: "Modern LED Desk Lamp",
    price: 29.99,
    oldPrice: 44.99,
    category: "Home & Kitchen",
    rating: 4.8,
    reviews: 631,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    description:
      "Modern LED lighting for desks, offices, bedrooms, studying, and everyday use.",
  },
  {
    id: 6,
    name: "Everyday Travel Backpack",
    price: 44.99,
    oldPrice: 64.99,
    category: "Travel",
    rating: 4.8,
    reviews: 1104,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    description:
      "Durable backpack with plenty of space for electronics, school supplies, clothing, and travel gear.",
  },
  {
    id: 7,
    name: "Soft Premium Throw Blanket",
    price: 32.99,
    oldPrice: 49.99,
    category: "Home & Kitchen",
    rating: 4.9,
    reviews: 1834,
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85",
    description:
      "Soft and comfortable decorative blanket for relaxing at home.",
  },
  {
    id: 8,
    name: "Kitchen Organization Set",
    price: 27.99,
    oldPrice: 39.99,
    category: "Home & Kitchen",
    rating: 4.7,
    reviews: 508,
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85",
    description:
      "Useful organization pieces designed to help keep your kitchen neat and organized.",
  },
];

const categories = [
  "All",
  "Electronics",
  "Home & Kitchen",
  "Travel",
  "Clothing",
  "Beauty",
  "Sports",
  "Toys",
  "Tools",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function buyNow(product) {
    addToCart(product);
    setCartOpen(true);
    setSelectedProduct(null);
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function openProduct(product) {
    setSelectedProduct(product);
    setCartOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setSelectedProduct(null);
    setCartOpen(false);
    setSearch("");
    setCategory("All");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f6f7f9;
          color: #171717;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .marlow-header {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .topbar {
          max-width: 1400px;
          margin: auto;
          min-height: 76px;
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 12px 24px;
        }

        .logo {
          border: 0;
          background: none;
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -1.5px;
          color: #111827;
          white-space: nowrap;
        }

        .tagline {
          font-size: 11px;
          color: #6b7280;
          margin-top: -4px;
        }

        .search-box {
          flex: 1;
          max-width: 700px;
          height: 48px;
          display: flex;
          border: 2px solid #111827;
          border-radius: 7px;
          overflow: hidden;
          background: white;
        }

        .search-box input {
          flex: 1;
          border: 0;
          outline: 0;
          padding: 0 17px;
          font-size: 15px;
        }

        .search-button {
          width: 58px;
          border: 0;
          background: #111827;
          color: white;
          font-size: 22px;
        }

        .header-action {
          border: 0;
          background: white;
          color: #111827;
          font-weight: 700;
          white-space: nowrap;
        }

        .cart-button {
          position: relative;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          padding: 11px 17px;
          background: white;
          font-weight: 800;
        }

        .cart-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          margin-left: 7px;
          padding: 0 5px;
          border-radius: 20px;
          background: #111827;
          color: white;
          font-size: 12px;
        }

        .category-bar {
          border-top: 1px solid #f0f0f0;
          background: white;
          overflow-x: auto;
        }

        .category-inner {
          max-width: 1400px;
          margin: auto;
          display: flex;
          gap: 4px;
          padding: 0 24px;
        }

        .category {
          border: 0;
          background: white;
          padding: 13px 17px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          color: #4b5563;
        }

        .category.active {
          color: #111827;
          box-shadow: inset 0 -3px 0 #111827;
        }

        .page {
          max-width: 1400px;
          margin: auto;
          padding: 24px;
        }

        .hero {
          min-height: 330px;
          border-radius: 14px;
          background: linear-gradient(115deg, #111827 0%, #374151 100%);
          color: white;
          display: flex;
          align-items: center;
          padding: 45px 55px;
          overflow: hidden;
          position: relative;
        }

        .hero-content {
          max-width: 650px;
          position: relative;
          z-index: 2;
        }

        .hero-label {
          display: inline-block;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 30px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hero h1 {
          margin: 18px 0 12px;
          font-size: clamp(36px, 5vw, 62px);
          line-height: .98;
          letter-spacing: -3px;
        }

        .hero p {
          color: #d1d5db;
          max-width: 550px;
          line-height: 1.6;
          margin-bottom: 25px;
        }

        .hero-button {
          border: 0;
          border-radius: 7px;
          background: white;
          color: #111827;
          padding: 13px 21px;
          font-weight: 800;
        }

        .hero-decoration {
          position: absolute;
          right: -80px;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          border: 80px solid rgba(255,255,255,.05);
        }

        .section {
          margin-top: 36px;
        }

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -.8px;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 17px;
        }

        .product-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          transition: transform .18s, box-shadow .18s;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,.09);
        }

        .product-image-button {
          border: 0;
          padding: 0;
          width: 100%;
          background: white;
          text-align: left;
        }

        .image-wrap {
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #f3f4f6;
        }

        .image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .25s;
        }

        .product-card:hover .image-wrap img {
          transform: scale(1.04);
        }

        .product-info {
          padding: 15px;
        }

        .product-category {
          color: #6b7280;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .product-name {
          margin: 6px 0;
          min-height: 40px;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 700;
          color: #111827;
        }

        .rating {
          font-size: 12px;
          color: #6b7280;
        }

        .stars {
          color: #111827;
          letter-spacing: 1px;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 9px;
        }

        .price {
          font-size: 21px;
          font-weight: 900;
          color: #111827;
        }

        .old-price {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          padding: 0 15px 15px;
        }

        .add-button,
        .buy-button {
          min-height: 40px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
        }

        .add-button {
          background: white;
          border: 1px solid #9ca3af;
          color: #111827;
        }

        .buy-button {
          background: #111827;
          border: 1px solid #111827;
          color: white;
        }

        .add-button:hover {
          background: #f3f4f6;
        }

        .buy-button:hover {
          background: #374151;
        }

        .feature-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-top: 36px;
        }

        .feature {
          padding: 21px;
          border-right: 1px solid #e5e7eb;
        }

        .feature:last-child {
          border-right: 0;
        }

        .feature strong {
          display: block;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .feature span {
          color: #6b7280;
          font-size: 12px;
        }

        .product-detail {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .back-button {
          border: 0;
          background: transparent;
          padding: 0;
          margin-bottom: 17px;
          font-weight: 700;
          color: #4b5563;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1.05fr .95fr;
        }

        .detail-image {
          background: #f3f4f6;
          min-height: 600px;
        }

        .detail-image img {
          width: 100%;
          height: 100%;
          min-height: 600px;
          object-fit: cover;
        }

        .detail-content {
          padding: 50px;
        }

        .detail-content h1 {
          font-size: 40px;
          line-height: 1.08;
          letter-spacing: -1.5px;
          margin: 10px 0;
        }

        .detail-price {
          font-size: 34px;
          font-weight: 900;
          margin: 22px 0;
        }

        .detail-description {
          color: #4b5563;
          line-height: 1.7;
          margin: 25px 0;
        }

        .detail-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .detail-actions button {
          min-height: 52px;
          border-radius: 7px;
          font-weight: 900;
        }

        .cart-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 30px;
        }

        .cart-item {
          display: flex;
          gap: 17px;
          padding: 17px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .cart-item img {
          width: 100px;
          height: 100px;
          border-radius: 7px;
          object-fit: cover;
        }

        .cart-item-info {
          flex: 1;
        }

        .quantity {
          display: inline-flex;
          align-items: center;
          gap: 13px;
          margin-top: 12px;
        }

        .quantity button {
          width: 30px;
          height: 30px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 5px;
          font-weight: 900;
        }

        .remove {
          border: 0;
          background: transparent;
          color: #6b7280;
          font-size: 12px;
          margin-left: 12px;
        }

        .cart-summary {
          margin-top: 25px;
          margin-left: auto;
          max-width: 400px;
        }

        .checkout {
          width: 100%;
          border: 0;
          background: #111827;
          color: white;
          padding: 15px;
          border-radius: 7px;
          margin-top: 15px;
          font-weight: 900;
        }

        .empty {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .empty h2 {
          color: #111827;
        }

        .footer {
          background: #111827;
          color: white;
          margin-top: 60px;
          padding: 45px 24px;
        }

        .footer-inner {
          max-width: 1400px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          gap: 30px;
        }

        .footer p {
          color: #9ca3af;
          max-width: 450px;
          line-height: 1.6;
        }

        @media (max-width: 1000px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .feature-strip {
            grid-template-columns: repeat(2, 1fr);
          }

          .feature:nth-child(2) {
            border-right: 0;
          }

          .feature:nth-child(-n+2) {
            border-bottom: 1px solid #e5e7eb;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .topbar {
            flex-wrap: wrap;
            gap: 10px;
          }

          .logo {
            font-size: 26px;
          }

          .header-action {
            display: none;
          }

          .search-box {
            order: 3;
            flex-basis: 100%;
          }

          .page {
            padding: 14px;
          }

          .hero {
            padding: 30px 24px;
            min-height: 290px;
          }

          .hero h1 {
            font-size: 39px;
          }

          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .product-info {
            padding: 11px;
          }

          .card-actions {
            padding: 0 11px 11px;
          }

          .feature-strip {
            grid-template-columns: 1fr;
          }

          .feature {
            border-right: 0 !important;
            border-bottom: 1px solid #e5e7eb;
          }

          .feature:last-child {
            border-bottom: 0;
          }

          .detail-content {
            padding: 25px;
          }

          .detail-content h1 {
            font-size: 30px;
          }

          .detail-image,
          .detail-image img {
            min-height: 350px;
          }

          .cart-panel {
            padding: 18px;
          }
        }
      `}</style>

      <header className="marlow-header">
        <div className="topbar">
          <button className="logo" onClick={goHome}>
            Marlow
            <div className="tagline">Shop smarter.</div>
          </button>

          <div className="search-box">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedProduct(null);
                setCartOpen(false);
              }}
              placeholder="What are you looking for today?"
            />
            <button className="search-button">⌕</button>
          </div>

          <button className="header-action">Account</button>

          <button
            className="cart-button"
            onClick={() => {
              setCartOpen(true);
              setSelectedProduct(null);
            }}
          >
            🛒 Cart
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>

        <nav className="category-bar">
          <div className="category-inner">
            {categories.map((item) => (
              <button
                key={item}
                className={`category ${
                  category === item ? "active" : ""
                }`}
                onClick={() => {
                  setCategory(item);
                  setSearch("");
                  setSelectedProduct(null);
                  setCartOpen(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="page">
        {!selectedProduct && !cartOpen && (
          <>
            {!search && category === "All" && (
              <section className="hero">
                <div className="hero-content">
                  <span className="hero-label">Welcome to Marlow</span>
                  <h1>Everything you're looking for, all in one place.</h1>
                  <p>
                    Discover products across the categories you shop most.
                    Search for what you need or explore our recommendations.
                  </p>
                  <button
                    className="hero-button"
                    onClick={() =>
                      document
                        .getElementById("recommended")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Shop Recommended
                  </button>
                </div>
                <div className="hero-decoration" />
              </section>
            )}

            <section className="section" id="recommended">
              <div className="section-heading">
                <div>
                  <h2>
                    {search
                      ? `Results for "${search}"`
                      : category !== "All"
                      ? category
                      : "Recommended for You"}
                  </h2>
                  <p>
                    {search
                      ? "Products matching your search"
                      : "Popular picks selected for Marlow shoppers"}
                  </p>
                </div>
                <span style={{ color: "#6b7280", fontSize: 13 }}>
                  {filteredProducts.length} products
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="empty">
                  <h2>We couldn't find that product.</h2>
                  <p>
                    Try another search. Our future supplier-search system will
                    be able to look through connected product sources when an
                    item isn't already in Marlow's catalog.
                  </p>
                </div>
              ) : (
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <article className="product-card" key={product.id}>
                      <button
                        className="product-image-button"
                        onClick={() => openProduct(product)}
                      >
                        <div className="image-wrap">
                          <img src={product.image} alt={product.name} />
                        </div>

                        <div className="product-info">
                          <div className="product-category">
                            {product.category}
                          </div>

                          <div className="product-name">
                            {product.name}
                          </div>

                          <div className="rating">
                            <span className="stars">★★★★★</span>{" "}
                            {product.rating} ({product.reviews.toLocaleString()})
                          </div>

                          <div className="price-row">
                            <span className="price">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="old-price">
                              ${product.oldPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </button>

                      <div className="card-actions">
                        <button
                          className="add-button"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </button>

                        <button
                          className="buy-button"
                          onClick={() => buyNow(product)}
                        >
                          Buy Now
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {!search && category === "All" && (
              <section className="feature-strip">
                <div className="feature">
                  <strong>Thousands of products</strong>
                  <span>Built to grow into a massive catalog.</span>
                </div>
                <div className="feature">
                  <strong>Easy shopping</strong>
                  <span>Search, compare, and find what you need.</span>
                </div>
                <div className="feature">
                  <strong>Product details</strong>
                  <span>Open products to see complete information.</span>
                </div>
                <div className="feature">
                  <strong>Simple checkout</strong>
                  <span>Add products or use Buy Now.</span>
                </div>
              </section>
            )}
          </>
        )}

        {selectedProduct && (
          <>
            <button
              className="back-button"
              onClick={() => setSelectedProduct(null)}
            >
              ← Back to shopping
            </button>

            <section className="product-detail">
              <div className="detail-grid">
                <div className="detail-image">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                </div>

                <div className="detail-content">
                  <div className="product-category">
                    {selectedProduct.category}
                  </div>

                  <h1>{selectedProduct.name}</h1>

                  <div className="rating">
                    <span className="stars">★★★★★</span>{" "}
                    {selectedProduct.rating} ·{" "}
                    {selectedProduct.reviews.toLocaleString()} reviews
                  </div>

                  <div className="detail-price">
                    ${selectedProduct.price.toFixed(2)}
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: 22,
                    }}
                  >
                    <strong>Product Information</strong>
                    <p className="detail-description">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="detail-actions">
                    <button
                      className="add-button"
                      onClick={() => addToCart(selectedProduct)}
                    >
                      Add to Cart
                    </button>

                    <button
                      className="buy-button"
                      onClick={() => buyNow(selectedProduct)}
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
              className="back-button"
              onClick={() => setCartOpen(false)}
            >
              ← Continue Shopping
            </button>

            <section className="cart-panel">
              <div className="section-heading">
                <div>
                  <h2>Your Cart</h2>
                  <p>
                    {cartCount} {cartCount === 1 ? "item" : "items"} in your
                    cart
                  </p>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="empty">
                  <h2>Your cart is empty.</h2>
                  <p>Add products to your cart and they'll appear here.</p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <img src={item.image} alt={item.name} />

                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <p style={{ color: "#6b7280", fontSize: 13 }}>
                          {item.category}
                        </p>

                        <strong>${item.price.toFixed(2)}</strong>

                        <div className="quantity">
                          <button
                            onClick={() => changeQuantity(item.id, -1)}
                          >
                            −
                          </button>

                          <strong>{item.quantity}</strong>

                          <button
                            onClick={() => changeQuantity(item.id, 1)}
                          >
                            +
                          </button>

                          <button
                            className="remove"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <strong>
                        ${(item.price * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  ))}

                  <div className="cart-summary">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 18,
                      }}
                    >
                      <strong>Subtotal</strong>
                      <strong>${cartTotal.toFixed(2)}</strong>
                    </div>

                    <button
                      className="checkout"
                      onClick={() =>
                        alert(
                          "Checkout will be connected when Marlow's payment and order system is added."
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

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong style={{ fontSize: 26 }}>Marlow</strong>
            <p>
              Shop smarter. Marlow is being built to become a large,
              easy-to-use online shopping destination.
            </p>
          </div>

          <div style={{ color: "#9ca3af", fontSize: 13 }}>
            © 2026 Marlow. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
