"use client";

import { useMemo, useState } from "react";

const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 39.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    description:
      "Comfortable wireless headphones with clear sound, cushioned ear cups, and a rechargeable battery.",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 49.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    description:
      "A modern smartwatch designed for everyday use with activity tracking and convenient notifications.",
  },
  {
    id: 3,
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    description:
      "Reusable stainless steel bottle designed to keep drinks cold or hot while you're on the go.",
  },
  {
    id: 4,
    name: "Portable Bluetooth Speaker",
    price: 34.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    description:
      "Compact portable speaker with wireless connectivity and powerful sound for home or travel.",
  },
  {
    id: 5,
    name: "LED Desk Lamp",
    price: 29.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    description:
      "Modern LED desk lamp providing adjustable lighting for work, reading, or studying.",
  },
  {
    id: 6,
    name: "Kitchen Organizer Set",
    price: 27.99,
    category: "Kitchen",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80",
    description:
      "Useful kitchen organization pieces designed to help keep counters, cabinets, and drawers organized.",
  },
  {
    id: 7,
    name: "Everyday Backpack",
    price: 44.99,
    category: "Travel",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    description:
      "Durable everyday backpack with room for personal items, electronics, school supplies, or travel gear.",
  },
  {
    id: 8,
    name: "Soft Throw Blanket",
    price: 32.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    description:
      "Soft decorative throw blanket made for relaxing on the couch, bed, or favorite chair.",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
    );
  }, [search]);

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function buyNow(product) {
    addToCart(product);
    setShowCart(true);
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  }

  function changeQuantity(productId, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setShowCart(false);
              setSearch("");
            }}
            className="text-2xl font-black tracking-tight text-slate-950"
          >
            Marlow
          </button>

          <div className="hidden flex-1 md:block">
            <div className="relative mx-auto max-w-2xl">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedProduct(null);
                  setShowCart(false);
                }}
                placeholder="Search products..."
                className="w-full rounded-full border border-slate-300 bg-slate-100 px-5 py-3 pr-12 outline-none transition focus:border-slate-900 focus:bg-white"
              />
              <span className="absolute right-5 top-3 text-lg">⌕</span>
            </div>
          </div>

          <button
            onClick={() => {
              setShowCart(true);
              setSelectedProduct(null);
            }}
            className="relative rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold transition hover:bg-slate-100"
          >
            Cart
            {cartCount > 0 && (
              <span className="ml-2 rounded-full bg-slate-900 px-2 py-1 text-xs text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="px-5 pb-4 md:hidden">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedProduct(null);
              setShowCart(false);
            }}
            placeholder="Search products..."
            className="w-full rounded-full border border-slate-300 bg-slate-100 px-5 py-3 outline-none focus:border-slate-900"
          />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12">
        {!selectedProduct && !showCart && (
          <>
            <div className="mb-10 rounded-3xl bg-slate-900 px-7 py-12 text-white md:px-12">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-slate-300">
                Welcome to Marlow
              </p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                Find what you need. Shop it with Marlow.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-300">
                Discover products, explore details, add items to your cart, or
                buy something right away.
              </p>
            </div>

            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {search ? "Search Results" : "For You"}
                </p>
                <h2 className="text-3xl font-black">
                  {search ? `Results for "${search}"` : "Recommended for You"}
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {filteredProducts.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h3 className="text-2xl font-bold">We couldn't find that yet.</h3>
                <p className="mt-2 text-slate-500">
                  Try another search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="block w-full text-left"
                    >
                      <div className="aspect-square overflow-hidden bg-slate-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {product.category}
                        </p>
                        <h3 className="mt-1 min-h-12 font-bold leading-tight">
                          {product.name}
                        </h3>
                        <p className="mt-3 text-xl font-black">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                      <button
                        onClick={() => addToCart(product)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-100"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={() => buyNow(product)}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700"
                      >
                        Buy Now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {selectedProduct && (
          <section className="mx-auto max-w-5xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="mb-6 font-semibold text-slate-600 hover:text-slate-950"
            >
              ← Back to products
            </button>

            <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
              <div className="bg-slate-100">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-full min-h-[350px] w-full object-cover"
                />
              </div>

              <div className="p-7 md:p-10">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {selectedProduct.category}
                </p>

                <h1 className="mt-2 text-3xl font-black md:text-4xl">
                  {selectedProduct.name}
                </h1>

                <p className="mt-5 text-3xl font-black">
                  ${selectedProduct.price.toFixed(2)}
                </p>

                <div className="my-7 h-px bg-slate-200" />

                <h2 className="text-lg font-bold">Product Information</h2>
                <p className="mt-3 leading-7 text-slate-600">
                  {selectedProduct.description}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => addToCart(selectedProduct)}
                    className="rounded-2xl border border-slate-300 px-5 py-4 font-bold hover:bg-slate-100"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={() => buyNow(selectedProduct)}
                    className="rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white hover:bg-slate-700"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {showCart && (
          <section className="mx-auto max-w-4xl">
            <button
              onClick={() => setShowCart(false)}
              className="mb-6 font-semibold text-slate-600 hover:text-slate-950"
            >
              ← Continue Shopping
            </button>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Your Cart
                  </p>
                  <h1 className="text-3xl font-black">Shopping Cart</h1>
                </div>

                <span className="rounded-full bg-slate-100 px-4 py-2 font-bold">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-5xl">🛒</div>
                  <h2 className="mt-5 text-2xl font-bold">
                    Your cart is empty
                  </h2>
                  <p className="mt-2 text-slate-500">
                    Add something from the store to see it here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-8 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-2xl border border-slate-200 p-4"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-24 w-24 rounded-xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="mt-1 font-black">
                            ${item.price.toFixed(2)}
                          </p>

                          <div className="mt-3 flex items-center gap-3">
                            <button
                              onClick={() => changeQuantity(item.id, -1)}
                              className="h-8 w-8 rounded-full border font-bold"
                            >
                              −
                            </button>

                            <span className="font-bold">{item.quantity}</span>

                            <button
                              onClick={() => changeQuantity(item.id, 1)}
                              className="h-8 w-8 rounded-full border font-bold"
                            >
                              +
                            </button>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-3 text-sm font-semibold text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <p className="font-black">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-semibold">Subtotal</span>
                      <span className="text-2xl font-black">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        alert(
                          "Checkout will be connected after the product catalog and payment system are added."
                        )
                      }
                      className="mt-5 w-full rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white hover:bg-slate-700"
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
