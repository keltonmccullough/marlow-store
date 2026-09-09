"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    try {
      const savedProduct = sessionStorage.getItem(
        "marlow-selected-product"
      );

      if (!savedProduct) {
        setLoading(false);
        return;
      }

      const parsedProduct = JSON.parse(savedProduct);

      if (
        parsedProduct &&
        String(parsedProduct.id) === String(params.id)
      ) {
        setProduct(parsedProduct);
      }
    } catch (error) {
      console.error("Could not load product:", error);
    }

    setLoading(false);
  }, [params.id]);

  function getCart() {
    try {
      const savedCart = localStorage.getItem("marlow-cart");

      if (!savedCart) {
        return [];
      }

      const cart = JSON.parse(savedCart);

      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      console.error("Could not read cart:", error);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(
        "marlow-cart",
        JSON.stringify(cart)
      );

      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Could not save cart:", error);
    }
  }

  function addToCart() {
    if (!product) return;

    const cart = getCart();

    const existingIndex = cart.findIndex(
      (item) =>
        String(item.id) === String(product.id)
    );

    if (existingIndex >= 0) {
      cart[existingIndex] = {
        ...cart[existingIndex],
        quantity:
          Number(cart[existingIndex].quantity || 1) +
          quantity,
      };
    } else {
      cart.push({
        ...product,
        quantity,
      });
    }

    saveCart(cart);

    alert("Added to cart!");
  }

  function buyNow() {
    if (!product) return;

    let account = null;

    try {
      const savedAccount =
        localStorage.getItem("marlow-account");

      if (savedAccount) {
        account = JSON.parse(savedAccount);
      }
    } catch (error) {
      console.error(
        "Could not read account:",
        error
      );
    }

    if (!account) {
      alert(
        "Please sign in or create an account before continuing to checkout."
      );

      return;
    }

    const cart = getCart();

    const existingIndex = cart.findIndex(
      (item) =>
        String(item.id) === String(product.id)
    );

    if (existingIndex >= 0) {
      cart[existingIndex] = {
        ...cart[existingIndex],
        quantity:
          Number(cart[existingIndex].quantity || 1) +
          quantity,
      };
    } else {
      cart.push({
        ...product,
        quantity,
      });
    }

    saveCart(cart);

    alert(
      "Your item is ready for checkout. Secure payment, tax, shipping, and order fulfillment are not connected yet."
    );
  }

  if (loading) {
    return (
      <>
        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            color: #333;
          }
        `}</style>

        <main className="loading-page">
          Loading product...
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <style jsx>{`
          .not-found-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            text-align: center;
            font-family: Arial, sans-serif;
          }

          .back-button {
            margin-top: 20px;
            padding: 12px 22px;
            border: none;
            border-radius: 8px;
            background: #111;
            color: white;
            cursor: pointer;
            font-size: 16px;
          }
        `}</style>

        <main className="not-found-page">
          <h1>Product not found</h1>

          <p>
            This product could not be loaded.
          </p>

          <button
            className="back-button"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .product-page {
          min-height: 100vh;
          background: #f7f7f7;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          color: #222;
        }

        .product-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding: 25px;
        }

        .back-row {
          margin-bottom: 20px;
        }

        .back-button {
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 16px;
          color: #333;
          padding: 8px 0;
        }

        .back-button:hover {
          text-decoration: underline;
        }

        .product-card {
          background: white;
          border-radius: 14px;
          padding: 30px;
          display: grid;
          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(0, 0.95fr);
          gap: 45px;
          box-shadow:
            0 2px 12px
            rgba(0, 0, 0, 0.08);
        }

        .image-section {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          min-width: 0;
        }

        .image-box {
          width: 100%;
          min-height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
        }

        .product-image {
          display: block;
          width: 100%;
          max-width: 650px;
          max-height: 620px;
          object-fit: contain;
        }

        .details-section {
          padding: 10px 0;
          min-width: 0;
        }

        .category {
          display: inline-block;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-name {
          margin: 0 0 18px;
          font-size: 34px;
          line-height: 1.15;
          font-weight: 700;
          color: #171717;
        }

        .price {
          margin-bottom: 25px;
          font-size: 32px;
          font-weight: 700;
          color: #111;
        }

        .description-title {
          margin: 0 0 10px;
          font-size: 20px;
        }

        .description {
          margin: 0 0 25px;
          color: #555;
          font-size: 16px;
          line-height: 1.65;
        }

        .product-info {
          border-top: 1px solid #e5e5e5;
          padding-top: 20px;
          margin-top: 20px;
        }

        .product-info-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #555;
        }

        .product-info-label {
          font-weight: 700;
          color: #222;
        }

        .purchase-box {
          margin-top: 28px;
          padding: 22px;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: #fff;
        }

        .quantity-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          width: fit-content;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }

        .quantity-button {
          width: 42px;
          height: 42px;
          border: none;
          background: #f4f4f4;
          cursor: pointer;
          font-size: 20px;
        }

        .quantity-button:hover {
          background: #e8e8e8;
        }

        .quantity-number {
          width: 45px;
          text-align: center;
          font-weight: 700;
        }

        .button-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .add-cart-button,
        .buy-now-button {
          width: 100%;
          min-height: 52px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          font-size: 17px;
          font-weight: 700;
          transition:
            transform 0.1s ease,
            opacity 0.2s ease;
        }

        .add-cart-button:hover,
        .buy-now-button:hover {
          opacity: 0.9;
        }

        .add-cart-button:active,
        .buy-now-button:active {
          transform: scale(0.99);
        }

        .add-cart-button {
          background: #f1f1f1;
          color: #111;
          border: 1px solid #ccc;
        }

        .buy-now-button {
          background: #111;
          color: white;
        }

        .checkout-note {
          margin: 15px 0 0;
          font-size: 12px;
          line-height: 1.5;
          color: #777;
          text-align: center;
        }

        @media (max-width: 850px) {
          .product-container {
            padding: 15px;
          }

          .product-card {
            grid-template-columns: 1fr;
            gap: 25px;
            padding: 20px;
          }

          .image-box {
            min-height: 350px;
          }

          .product-image {
            max-height: 420px;
          }

          .product-name {
            font-size: 28px;
          }

          .price {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .product-card {
            padding: 15px;
            border-radius: 10px;
          }

          .image-box {
            min-height: 280px;
          }

          .product-name {
            font-size: 24px;
          }

          .price {
            font-size: 25px;
          }

          .purchase-box {
            padding: 15px;
          }
        }
      `}</style>

      <main className="product-page">
        <div className="product-container">

          <div className="back-row">
            <button
              className="back-button"
              onClick={() => router.back()}
            >
              ← Back to Products
            </button>
          </div>

          <section className="product-card">

            <div className="image-section">
              <div className="image-box">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
              </div>
            </div>

            <div className="details-section">

              <div className="category">
                {product.category || "Product"}
              </div>

              <h1 className="product-name">
                {product.name}
              </h1>

              <div className="price">
                $
                {Number(product.price || 0).toFixed(2)}
              </div>

              <h2 className="description-title">
                Product Details
              </h2>

              <p className="description">
                {product.description ||
                  "Product details are currently unavailable."}
              </p>

              {(product.brand ||
                product.sku ||
                product.productSku) && (
                <div className="product-info">

                  {product.brand && (
                    <div className="product-info-row">
                      <span className="product-info-label">
                        Brand:
                      </span>
                      <span>
                        {product.brand}
                      </span>
                    </div>
                  )}

                  {(product.sku ||
                    product.productSku) && (
                    <div className="product-info-row">
                      <span className="product-info-label">
                        SKU:
                      </span>
                      <span>
                        {product.sku ||
                          product.productSku}
                      </span>
                    </div>
                  )}

                </div>
              )}

              <div className="purchase-box">

                <label className="quantity-label">
                  Quantity
                </label>

                <div className="quantity-controls">

                  <button
                    className="quantity-button"
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          quantity - 1
                        )
                      )
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <div className="quantity-number">
                    {quantity}
                  </div>

                  <button
                    className="quantity-button"
                    onClick={() =>
                      setQuantity(
                        quantity + 1
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>

                <div className="button-row">

                  <button
                    className="buy-now-button"
                    onClick={buyNow}
                  >
                    Buy Now
                  </button>

                  <button
                    className="add-cart-button"
                    onClick={addToCart}
                  >
                    Add to Cart
                  </button>

                </div>

                <p className="checkout-note">
                  Secure payment, tax, shipping,
                  and order fulfillment will be
                  connected before the store goes
                  live.
                </p>

              </div>

            </div>

          </section>

        </div>
      </main>
    </>
  );
}
