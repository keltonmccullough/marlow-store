"use client";

import { useMemo, useState } from "react";

const products = [
  {
    id: 1,
    name: "Marlow Everyday Backpack",
    category: "Travel",
    price: 39.99,
    rating: 4.8,
    emoji: "🎒",
  },
  {
    id: 2,
    name: "Wireless Bluetooth Earbuds",
    category: "Electronics",
    price: 29.99,
    rating: 4.7,
    emoji: "🎧",
  },
  {
    id: 3,
    name: "Portable LED Desk Lamp",
    category: "Home",
    price: 24.99,
    rating: 4.6,
    emoji: "💡",
  },
  {
    id: 4,
    name: "Stainless Steel Water Bottle",
    category: "Lifestyle",
    price: 19.99,
    rating: 4.9,
    emoji: "🥤",
  },
  {
    id: 5,
    name: "Smart Fitness Watch",
    category: "Electronics",
    price: 59.99,
    rating: 4.5,
    emoji: "⌚",
  },
  {
    id: 6,
    name: "Cozy Throw Blanket",
    category: "Home",
    price: 34.99,
    rating: 4.8,
    emoji: "🧺",
  },
  {
    id: 7,
    name: "Travel Organizer Set",
    category: "Travel",
    price: 22.99,
    rating: 4.7,
    emoji: "🧳",
  },
  {
    id: 8,
    name: "Everyday Phone Stand",
    category: "Accessories",
    price: 14.99,
    rating: 4.6,
    emoji: "📱",
  },
];

const languages = [
  "English",
  "Español",
  "Français",
  "Deutsch",
  "Italiano",
  "Português",
  "中文",
  "日本語",
  "한국어",
  "العربية",
];

export default function Home() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [notice, setNotice] = useState("");

  const categories = ["All", "Electronics", "Home", "Travel", "Lifestyle", "Accessories"];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
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

    setNotice(`${product.name} added to your cart.`);
    setTimeout(() => setNotice(""), 2500);
  }

  function showComingSoon(message) {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  }

  return (
    <main className="site">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          background: #f7f8fa;
          color: #14171c;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .site {
          min-height: 100vh;
        }

        .topbar {
          background: #111827;
          color: white;
          text-align: center;
          padding: 9px 16px;
          font-size: 13px;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .headerInner {
          max-width: 1200px;
          margin: auto;
          padding: 17px 22px;
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .logo {
          border: 0;
          background: transparent;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -1px;
          color: #111827;
          padding: 0;
        }

        .search {
          flex: 1;
          position: relative;
        }

        .search input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 999px;
          padding: 13px 18px;
          outline: none;
          background: #f9fafb;
        }

        .search input:focus {
          border-color: #111827;
          background: white;
        }

        .headerActions {
          display: flex;
          gap: 9px;
          align-items: center;
        }

        .iconButton {
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 12px;
          padding: 10px 12px;
          font-weight: 700;
        }

        .cartButton {
          position: relative;
        }

        .badge {
          position: absolute;
          top: -7px;
          right: -6px;
          background: #dc2626;
          color: white;
          min-width: 20px;
          height: 20px;
          border-radius: 999px;
          font-size: 11px;
          display: grid;
          place-items: center;
          border: 2px solid white;
        }

        .nav {
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .navInner {
          max-width: 1200px;
          margin: auto;
          padding: 0 22px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .nav button {
          border: 0;
          background: transparent;
          padding: 13px 15px;
          color: #4b5563;
          white-space: nowrap;
        }

        .nav button.active {
          color: #111827;
          font-weight: 800;
          border-bottom: 2px solid #111827;
        }

        .hero {
          max-width: 1200px;
          margin: 28px auto 0;
          padding: 0 22px;
        }

        .heroCard {
          border-radius: 26px;
          background: linear-gradient(135deg, #111827, #374151);
          color: white;
          padding: 55px;
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          overflow: hidden;
        }

        .heroText {
          max-width: 620px;
        }

        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 12px;
          font-weight: 800;
          opacity: 0.75;
        }

        .hero h1 {
          font-size: clamp(40px, 6vw, 68px);
          line-height: 0.98;
          letter-spacing: -3px;
          margin: 14px 0 20px;
        }

        .hero p {
          font-size: 18px;
          line-height: 1.6;
          color: #e5e7eb;
          margin-bottom: 26px;
        }

        .primary {
          border: 0;
          border-radius: 12px;
          background: white;
          color: #111827;
          padding: 13px 19px;
          font-weight: 800;
        }

        .heroVisual {
          font-size: 150px;
          filter: drop-shadow(0 25px 30px rgba(0, 0, 0, 0.25));
        }

        .section {
          max-width: 1200px;
          margin: 42px auto;
          padding: 0 22px;
        }

        .sectionHeader {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .section h2 {
          font-size: 28px;
          margin: 0;
          letter-spacing: -1px;
        }

        .muted {
          color: #6b7280;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .product {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .product:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }

        .productImage {
          min-height: 190px;
          display: grid;
          place-items: center;
          background: #f3f4f6;
          font-size: 76px;
        }

        .productBody {
          padding: 16px;
        }

        .productCategory {
          color: #6b7280;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .product h3 {
          font-size: 16px;
          min-height: 44px;
          margin: 8px 0;
        }

        .rating {
          font-size: 13px;
          margin-bottom: 13px;
        }

        .priceRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .price {
          font-weight: 900;
          font-size: 19px;
        }

        .addButton {
          border: 0;
          border-radius: 10px;
          background: #111827;
          color: white;
          padding: 10px 12px;
          font-weight: 800;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .feature {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 22px;
          border-radius: 16px;
        }

        .feature strong {
          display: block;
          margin-bottom: 7px;
        }

        .footer {
          background: #111827;
          color: white;
          margin-top: 60px;
          padding: 45px 22px;
        }

        .footerInner {
          max-width: 1200px;
          margin: auto;
          display: grid;
          grid-template-columns: 2fr repeat(3, 1fr);
          gap: 35px;
        }

        .footer h3 {
          margin-top: 0;
        }

        .footer button {
          display: block;
          border: 0;
          background: transparent;
          color: #d1d5db;
          padding: 6px 0;
          text-align: left;
        }

        .modalBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: grid;
          place-items: center;
          z-index: 100;
          padding: 20px;
        }

        .modal {
          width: min(470px, 100%);
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
        }

        .modalHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .close {
          border: 0;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 8px 11px;
        }

        .formInput,
        .formSelect,
        .formText {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 12px;
          margin: 7px 0 13px;
        }

        .modalPrimary {
          width: 100%;
          border: 0;
          border-radius: 10px;
          padding: 13px;
          background: #111827;
          color: white;
          font-weight: 800;
        }

        .assistant {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 50;
        }

        .assistantButton {
          border: 0;
          border-radius: 999px;
          background: #111827;
          color: white;
          padding: 14px 18px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          font-weight: 800;
        }

        .assistantBox {
          width: min(350px, calc(100vw - 40px));
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          margin-bottom: 10px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .assistantTop {
          background: #111827;
          color: white;
          padding: 16px;
        }

        .assistantBody {
          padding: 16px;
        }

        .notice {
          position: fixed;
          left: 50%;
          top: 78px;
          transform: translateX(-50%);
          background: #111827;
          color: white;
          padding: 12px 17px;
          border-radius: 10px;
          z-index: 200;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 900px) {
          .products {
            grid-template-columns: repeat(2, 1fr);
          }

          .features {
            grid-template-columns: repeat(2, 1fr);
          }

          .heroCard {
            padding: 35px;
          }

          .heroVisual {
            font-size: 90px;
          }

          .footerInner {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .headerInner {
            flex-wrap: wrap;
          }

          .search {
            order: 3;
            flex-basis: 100%;
          }

          .heroCard {
            min-height: 0;
            padding: 30px 24px;
          }

          .heroVisual {
            display: none;
          }

          .products,
          .features {
            grid-template-columns: 1fr;
          }

          .footerInner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="topbar">
        Free shipping on qualifying orders • Shop Marlow with confidence
      </div>

      <header className="header">
        <div className="headerInner">
          <button className="logo" onClick={() => setCategory("All")}>
            MARLOW
          </button>

          <div className="search">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </div>

          <div className="headerActions">
            <button
              className="iconButton"
              onClick={() => setAccountOpen(true)}
            >
              👤 Account
            </button>

            <button
              className="iconButton cartButton"
              onClick={() =>
                showComingSoon(
                  cartCount
                    ? `${cartCount} item(s) in your cart • $${cartTotal.toFixed(2)}`
                    : "Your cart is empty."
                )
              }
            >
              🛒 Cart
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        <nav className="nav">
          <div className="navInner">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}

            <button onClick={() => setAssistantOpen(true)}>
              🤖 AI Shopping Assistant
            </button>

            <button onClick={() => setSupportOpen(true)}>
              Help & Support
            </button>

            <select
              className="formSelect"
              style={{
                width: "auto",
                margin: "5px 0",
                border: 0,
                background: "transparent",
              }}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label="Language"
            >
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </nav>
      </header>

      {notice && <div className="notice">{notice}</div>}

      <section className="hero">
        <div className="heroCard">
          <div className="heroText">
            <div className="eyebrow">Welcome to Marlow</div>
            <h1>Better shopping. Made simple.</h1>
            <p>
              Discover useful products, great everyday values, and a shopping
              experience designed around you.
            </p>
            <button
              className="primary"
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Shop Now →
            </button>
          </div>

          <div className="heroVisual">🛍️</div>
        </div>
      </section>

      <section className="section" id="products">
        <div className="sectionHeader">
          <div>
            <h2>Featured Products</h2>
            <div className="muted">
              {filteredProducts.length} products available
            </div>
          </div>
        </div>

        <div className="products">
          {filteredProducts.map((product) => (
            <article className="product" key={product.id}>
              <div className="productImage">{product.emoji}</div>

              <div className="productBody">
                <div className="productCategory">{product.category}</div>
                <h3>{product.name}</h3>
                <div className="rating">
                  ⭐ {product.rating} • Highly rated
                </div>

                <div className="priceRow">
                  <div className="price">${product.price.toFixed(2)}</div>

                  <button
                    className="addButton"
                    onClick={() => addToCart(product)}
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="feature">
            <strong>No products found.</strong>
            <span className="muted">
              Try another search or choose a different category.
            </span>
          </div>
        )}
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2>Why shop Marlow?</h2>
            <div className="muted">Built for a modern shopping experience.</div>
          </div>
        </div>

        <div className="features">
          <div className="feature">
            <div style={{ fontSize: 30 }}>🔒</div>
            <strong>Secure Shopping</strong>
            <span className="muted">
              Customer accounts and secure checkout infrastructure can be
              connected as the platform is completed.
            </span>
          </div>

          <div className="feature">
            <div style={{ fontSize: 30 }}>🤖</div>
            <strong>AI Shopping Help</strong>
            <span className="muted">
              Get help finding products and deciding what fits your needs.
            </span>
          </div>

          <div className="feature">
            <div style={{ fontSize: 30 }}>🌎</div>
            <strong>Global Customers</strong>
            <span className="muted">
              Multiple language options are built into the storefront design.
            </span>
          </div>

          <div className="feature">
            <div style={{ fontSize: 30 }}>💬</div>
            <strong>Customer Support</strong>
            <span className="muted">
              Customers can reach support with questions, concerns, and
              complaints.
            </span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footerInner">
          <div>
            <h3>MARLOW</h3>
            <p style={{ color: "#9ca3af", lineHeight: 1.6 }}>
              A modern online shopping platform designed to make buying simple.
            </p>
            <p style={{ color: "#6b7280", fontSize: 13 }}>
              © {new Date().getFullYear()} Marlow. All rights reserved.
            </p>
          </div>

          <div>
            <h3>Shop</h3>
            <button onClick={() => setCategory("Electronics")}>
              Electronics
            </button>
            <button onClick={() => setCategory("Home")}>Home</button>
            <button onClick={() => setCategory("Travel")}>Travel</button>
            <button onClick={() => setCategory("Lifestyle")}>Lifestyle</button>
          </div>

          <div>
            <h3>Customer</h3>
            <button onClick={() => setAccountOpen(true)}>
              My Account
            </button>
            <button onClick={() => setSupportOpen(true)}>
              Help Center
            </button>
            <button
              onClick={() =>
                showComingSoon("Returns information will be connected next.")
              }
            >
              Returns
            </button>
          </div>

          <div>
            <h3>Business</h3>
            <button
              onClick={() =>
                showComingSoon("Business and admin access will be connected.")
              }
            >
              Admin Portal
            </button>
            <button
              onClick={() =>
                showComingSoon("Supplier management will be connected.")
              }
            >
              Supplier Network
            </button>
            <button
              onClick={() =>
                showComingSoon("Business information will be available here.")
              }
            >
              About Marlow
            </button>
          </div>
        </div>
      </footer>

      {accountOpen && (
        <div
          className="modalBackdrop"
          onClick={() => setAccountOpen(false)}
        >
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
              <h2>Customer Account</h2>
              <button
                className="close"
                onClick={() => setAccountOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="muted">
              Your Marlow customer account will let you manage orders,
              addresses, saved products, and account preferences.
            </p>

            <label>Email or Username</label>
            <input
              className="formInput"
              placeholder="Enter your email or username"
            />

            <label>Password</label>
            <input
              className="formInput"
              type="password"
              placeholder="Enter your password"
            />

            <button
              className="modalPrimary"
              onClick={() =>
                showComingSoon(
                  "Account authentication will be connected to the secure customer system."
                )
              }
            >
              Sign In
            </button>

            <button
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                padding: 14,
              }}
              onClick={() =>
                showComingSoon("Customer account registration is next.")
              }
            >
              Create a new account
            </button>
          </div>
        </div>
      )}

      {supportOpen && (
        <div
          className="modalBackdrop"
          onClick={() => setSupportOpen(false)}
        >
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
              <h2>Help & Support</h2>
              <button className="close" onClick={() => setSupportOpen(false)}>
                ✕
              </button>
            </div>

            <p className="muted">
              Have a question, complaint, or concern? Send a message to the
              Marlow support team.
            </p>

            <input className="formInput" placeholder="Your name" />
            <input className="formInput" placeholder="Email address" />

            <select className="formSelect">
              <option>Question</option>
              <option>Order problem</option>
              <option>Complaint</option>
              <option>Product concern</option>
              <option>Other</option>
            </select>

            <textarea
              className="formText"
              rows="5"
              placeholder="How can we help?"
            />

            <button
              className="modalPrimary"
              onClick={() =>
                showComingSoon(
                  "Support ticket delivery will be connected to the Marlow admin alert system."
                )
              }
            >
              Send Support Request
            </button>
          </div>
        </div>
      )}

      <div className="assistant">
        {assistantOpen && (
          <div className="assistantBox">
            <div className="assistantTop">
              <strong>🤖 Marlow Shopping Assistant</strong>
              <div style={{ fontSize: 13, marginTop: 5, opacity: 0.8 }}>
                What are you shopping for today?
              </div>
            </div>

            <div className="assistantBody">
              <p>
                I can help you browse categories, compare products, and find
                items based on what you're looking for.
              </p>

              <button
                className="modalPrimary"
                onClick={() => {
                  setAssistantOpen(false);
                  setCategory("Electronics");
                  setNotice("Showing electronics you may like.");
                  setTimeout(() => setNotice(""), 2500);
                }}
              >
                Show me electronics
              </button>

              <button
                style={{
                  width: "100%",
                  marginTop: 8,
                  border: "1px solid #d1d5db",
                  background: "white",
                  borderRadius: 10,
                  padding: 11,
                }}
                onClick={() => {
                  setAssistantOpen(false);
                  setCategory("Home");
                }}
              >
                Help me shop for my home
              </button>
            </div>
          </div>
        )}

        <button
          className="assistantButton"
          onClick={() => setAssistantOpen((open) => !open)}
        >
          🤖 AI Assistant
        </button>
      </div>
    </main>
  );
}
