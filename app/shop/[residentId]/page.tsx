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
    if (subtotal > 100) return 0;
    return 10;
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center border-8 border-black p-12 bg-yellow-400">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-6"></div>
          <p className="text-black font-black uppercase tracking-widest text-lg">LOADING SHOP...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center border-8 border-black bg-yellow-400 p-16">
          <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">SHOP NOT FOUND</h2>
          <button
            onClick={() => router.push("/residents")}
            className="bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            BROWSE ALL RESIDENTS
          </button>
        </div>
      </div>
    );
  }

  if (orderCreated && clientSecret) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border-8 border-black p-8 bg-white">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>

          <div className="bg-yellow-400 border-8 border-black p-8 h-fit">
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-4">ORDER SUMMARY</h3>
            <div className="space-y-6">
              {cart.map(item => {
                const product = getCartItemDetails(item);
                return product ? (
                  <div key={item.productId} className="flex justify-between text-sm font-bold uppercase tracking-wide">
                    <span>{product.name} ×{item.quantity}</span>
                    <span className="font-black">${(product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ) : null;
              })}
              <div className="border-t-4 border-black pt-6 space-y-3">
                <div className="flex justify-between text-sm font-bold uppercase tracking-wide">
                  <span>SUBTOTAL</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold uppercase tracking-wide">
                  <span>SHIPPING</span>
                  <span>${calculateShipping().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-2xl border-t-4 border-black pt-4 uppercase">
                  <span>TOTAL</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 bg-white">
      <h1 className="text-6xl font-black mb-12 uppercase tracking-tight border-b-8 border-black pb-6">
        {resident.user.name?.toUpperCase()}'S SHOP
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products */}
        <div className="lg:col-span-2">
          <div className="bg-white border-8 border-black p-8">
            <h2 className="text-4xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-6">PRODUCTS</h2>
            
            {resident.products && resident.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resident.products.map((product: Product) => (
                  <div key={product.id} className="border-4 border-black p-6 bg-white hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                    {product.images && product.images.length > 0 && (
                      <div className="relative w-full h-56 mb-4 border-4 border-black overflow-hidden">
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover grayscale"
                        />
                      </div>
                    )}
                    <h3 className="font-black text-xl mb-2 uppercase tracking-tight">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm font-medium mb-4 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b-4 border-black">
                      <div>
                        <p className="text-3xl font-black">${product.price}</p>
                        {product.compareAtPrice && (
                          <p className="text-sm font-bold uppercase tracking-wide line-through opacity-60">
                            ${product.compareAtPrice}
                          </p>
                        )}
                      </div>
                      {product.trackInventory && (
                        <p className="text-sm font-bold uppercase tracking-wide border-4 border-black px-3 py-1 bg-white">
                          {product.stock ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.trackInventory && !product.stock}
                      className="w-full bg-black text-white px-6 py-3 border-4 border-black hover:bg-white hover:text-black transition-colors font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ADD TO CART
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-4 border-black bg-yellow-400">
                <p className="text-black font-black uppercase tracking-wider text-xl">NO PRODUCTS AVAILABLE</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div>
          <div className="bg-yellow-400 border-8 border-black p-8 sticky top-24">
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-4">SHOPPING CART</h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-12 border-4 border-black bg-white">
                <p className="text-black font-black uppercase tracking-wider">YOUR CART IS EMPTY</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {cart.map(item => {
                    const product = getCartItemDetails(item);
                    return product ? (
                      <div key={item.productId} className="flex items-center gap-3 pb-4 border-b-4 border-black">
                        <div className="flex-1">
                          <p className="font-black text-sm uppercase tracking-tight">{product.name}</p>
                          <p className="font-black text-xl">${product.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-10 h-10 border-4 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors font-black text-xl"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-black text-xl">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-10 h-10 border-4 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors font-black text-xl"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="w-10 h-10 border-4 border-black bg-black text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors font-black text-2xl"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>

                <div className="space-y-3 mb-8 pb-8 border-b-4 border-black">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wide">
                    <span>SUBTOTAL</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wide">
                    <span>SHIPPING</span>
                    <span>{calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-black text-2xl pt-4 border-t-4 border-black uppercase">
                    <span>TOTAL</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-black text-lg uppercase tracking-wider border-b-4 border-black pb-3">SHIPPING INFORMATION</h4>
                  <input
                    type="text"
                    placeholder="FULL NAME"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="w-full px-4 py-3 border-4 border-black text-sm font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                  />
                  <input
                    type="text"
                    placeholder="ADDRESS"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full px-4 py-3 border-4 border-black text-sm font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="CITY"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-3 border-4 border-black text-sm font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                    />
                    <input
                      type="text"
                      placeholder="STATE"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-4 py-3 border-4 border-black text-sm font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="ZIP"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className="w-full px-4 py-3 border-4 border-black text-sm font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                    />
                    <input
                      type="text"
                      placeholder="COUNTRY"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full px-4 py-3 border-4 border-black text-sm font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white px-8 py-5 font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg"
                >
                  PROCEED TO CHECKOUT
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}