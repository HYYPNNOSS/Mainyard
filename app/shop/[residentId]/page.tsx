"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface CartItem {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number | null;
  trackInventory: boolean;
  images: Array<{ url: string; order: number }>;
}

interface ShopPageProps {
  params: Promise<{ residentId: string }>;
}

export default function ShopPage({ params }: ShopPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [residentId, setResidentId] = useState("");
  const [resident, setResident] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [orderCreated, setOrderCreated] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    async function init() {
      const { residentId: id } = await params;
      setResidentId(id);

      try {
        const response = await fetch(`/api/residence/${id}`);
        
        if (!response.ok) {
          console.error("Failed to fetch resident:", response.status);
          router.push("/residents");
          return;
        }
        
        const data = await response.json();
        setResident(data);
      } catch (error) {
        console.error("Error loading resident:", error);
        router.push("/residents");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [params, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/shop/${residentId}`);
    }
  }, [status, router, residentId]);

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const getCartItemDetails = (item: CartItem) => {
    return resident?.products?.find((p: Product) => p.id === item.productId);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const product = getCartItemDetails(item);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal > 100) return 0; // Free shipping over $100
    return 10; // Flat rate shipping
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city) {
      alert("Please fill in all shipping information");
      return;
    }

    try {
      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId,
          items: cart,
          shippingAddress,
          subtotal: calculateSubtotal(),
          shippingCost: calculateShipping(),
          total: calculateTotal(),
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderResponse.json();

      // Create Stripe checkout session for the order
      const checkoutResponse = await fetch("/api/checkout-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: calculateTotal(),
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { clientSecret: secret } = await checkoutResponse.json();
      setClientSecret(secret);
      setOrderCreated(true);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to process checkout");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Shop Not Found</h2>
          <button
            onClick={() => router.push("/residents")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Browse All Residents
          </button>
        </div>
      </div>
    );
  }

  if (orderCreated && clientSecret) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-4">
              {cart.map(item => {
                const product = getCartItemDetails(item);
                return product ? (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{product.name} x{item.quantity}</span>
                    <span className="font-semibold">${(product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ) : null;
              })}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${calculateShipping().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">{resident.user.name}'s Shop</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Products</h2>
            
            {resident.products && resident.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resident.products.map((product: Product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    {product.images && product.images.length > 0 && (
                      <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xl font-bold text-blue-600">${product.price}</p>
                        {product.compareAtPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ${product.compareAtPrice}
                          </p>
                        )}
                      </div>
                      {product.trackInventory && (
                        <p className="text-sm text-gray-600">
                          {product.stock ? `${product.stock} in stock` : 'Out of stock'}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.trackInventory && !product.stock}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No products available</p>
            )}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Shopping Cart</h3>
            
            {cart.length === 0 ? (
              <p className="text-gray-600 mb-4">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map(item => {
                    const product = getCartItemDetails(item);
                    return product ? (
                      <div key={item.productId} className="flex items-center gap-3 pb-3 border-b">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{product.name}</p>
                          <p className="text-blue-600 font-bold">${product.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>

                <div className="space-y-2 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold">Shipping Information</h4>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
placeholder="Address"
value={shippingAddress.address}
onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
className="w-full px-3 py-2 border rounded-lg text-sm"
/>
<div className="grid grid-cols-2 gap-2">
<input
type="text"
placeholder="City"
value={shippingAddress.city}
onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
className="w-full px-3 py-2 border rounded-lg text-sm"
/>
<input
type="text"
placeholder="State"
value={shippingAddress.state}
onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
className="w-full px-3 py-2 border rounded-lg text-sm"
/>
</div>
<div className="grid grid-cols-2 gap-2">
<input
type="text"
placeholder="ZIP"
value={shippingAddress.zip}
onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
className="w-full px-3 py-2 border rounded-lg text-sm"
/>
<input
type="text"
placeholder="Country"
value={shippingAddress.country}
onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
className="w-full px-3 py-2 border rounded-lg text-sm"
/>
</div>
</div>            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  </div>
</div>
);
}