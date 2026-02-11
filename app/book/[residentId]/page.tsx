"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { getAvailableSlots, createBooking } from "@/server/actions/bookingActions";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface BookingPageProps {
  params: Promise<{ residentId: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [residentId, setResidentId] = useState("");
  const [resident, setResident] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [bookingCreated, setBookingCreated] = useState(false);

  // Pre-select service from URL if provided
  useEffect(() => {
    const serviceId = searchParams.get("serviceId");
    if (serviceId) {
      setSelectedServices([serviceId]);
    }
  }, [searchParams]);

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
      router.push(`/auth/signin?callbackUrl=/book/${residentId}`);
    }
  }, [status, router, residentId]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !residentId) return;

      try {
        const slots = await getAvailableSlots(residentId, selectedDate);
        setAvailableSlots(slots);
        setSelectedSlot("");
      } catch (error) {
        console.error("Failed to load slots:", error);
      }
    }

    loadSlots();
  }, [selectedDate, residentId]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    if (!resident?.services) return 0;
    return selectedServices.reduce((total, serviceId) => {
      const service = resident.services.find((s: Service) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const getTotalDuration = () => {
    if (!resident?.services) return 0;
    return selectedServices.reduce((total, serviceId) => {
      const service = resident.services.find((s: Service) => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  async function handleBooking() {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }
    if (!selectedDate || !selectedSlot) {
      alert("Please select a date and time slot");
      return;
    }

    try {
      const booking = await createBooking(
        residentId, 
        selectedDate, 
        selectedSlot,
        selectedServices
      );

      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          residentId,
          amount: calculateTotal(),
          services: selectedServices,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
      setBookingCreated(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center border-8 border-black p-12 bg-yellow-400">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-6"></div>
          <p className="text-black font-black uppercase tracking-widest text-lg">LOADING BOOKING PAGE...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center border-8 border-black bg-yellow-400 p-16">
          <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">RESIDENT NOT FOUND</h2>
          <p className="text-black mb-8 font-bold uppercase tracking-wide">WE COULDN'T FIND THE RESIDENT YOU'RE TRYING TO BOOK.</p>
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

  if (bookingCreated && clientSecret) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border-8 border-black p-8 bg-white">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>

          <div className="bg-yellow-400 border-8 border-black p-8 h-fit">
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-4">BOOKING SUMMARY</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2">PROFESSIONAL</p>
                <p className="font-black text-xl uppercase">{resident.user.name}</p>
              </div>
              <div className="border-t-4 border-black pt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-3">SERVICES</p>
                {selectedServices.map(serviceId => {
                  const service = resident.services.find((s: Service) => s.id === serviceId);
                  return service ? (
                    <div key={service.id} className="flex justify-between text-sm font-bold mb-2 uppercase tracking-wide">
                      <span>{service.name}</span>
                      <span className="font-black">${service.price}</span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="border-t-4 border-black pt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-2">DATE</p>
                <p className="font-black text-lg uppercase">
                  {new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="border-t-4 border-black pt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-2">TIME</p>
                <p className="font-black text-lg uppercase">{selectedSlot}</p>
              </div>
              <div className="border-t-4 border-black pt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-2">DURATION</p>
                <p className="font-black text-lg uppercase">{getTotalDuration()} MINUTES</p>
              </div>
              <div className="border-t-4 border-black pt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-3">TOTAL AMOUNT</p>
                <p className="text-5xl font-black">
                  ${calculateTotal()}
                </p>
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
        BOOK {resident.user.name?.toUpperCase()}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border-8 border-black p-8 mb-8">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tight">SELECT SERVICES</h2>
            
            {resident.services && resident.services.length > 0 ? (
              <div className="space-y-4">
                {resident.services.map((service: Service) => (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-6 border-4 cursor-pointer transition-all ${
                      selectedServices.includes(service.id)
                        ? 'border-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => {}}
                            className="w-6 h-6 border-4 border-black accent-black"
                          />
                          <div>
                            <h4 className="font-black text-xl uppercase tracking-tight">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-black mt-2 font-medium">{service.description}</p>
                            )}
                            <p className="text-sm text-black mt-3 font-bold uppercase tracking-wide">
                              DURATION: {service.duration} MINUTES
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-3xl font-black">${service.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-black font-bold uppercase tracking-wide">NO SERVICES AVAILABLE</p>
            )}
          </div>

          <div className="bg-white border-8 border-black p-8">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tight">SELECT DATE & TIME</h2>

            <div className="space-y-8">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-black uppercase tracking-widest mb-4">
                  SELECT DATE
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-bold text-black uppercase"
                />
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-black uppercase tracking-widest mb-4">
                    SELECT TIME SLOT
                  </label>
                  {availableSlots.length === 0 ? (
                    <p className="text-black font-bold uppercase tracking-wide border-4 border-black bg-yellow-400 p-6">
                      NO AVAILABLE SLOTS FOR THIS DATE
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 border-4 border-black font-black uppercase tracking-wide transition-all ${
                            selectedSlot === slot
                              ? "bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              : "bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Booking Button */}
              <button
                onClick={handleBooking}
                disabled={selectedServices.length === 0 || !selectedDate || !selectedSlot}
                className="w-full bg-black text-white px-8 py-5 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                CONTINUE TO PAYMENT
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-yellow-400 border-8 border-black p-8 h-fit sticky top-24">
          <h3 className="text-3xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-4">BOOKING SUMMARY</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-2">PROFESSIONAL</p>
              <p className="font-black text-xl uppercase">{resident.user.name}</p>
            </div>
            
            {selectedServices.length > 0 && (
              <div className="border-t-4 border-black pt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-3">SELECTED SERVICES</p>
                <div className="space-y-2">
                  {selectedServices.map(serviceId => {
                    const service = resident.services.find((s: Service) => s.id === serviceId);
                    return service ? (
                      <div key={service.id} className="flex justify-between text-sm font-bold uppercase tracking-wide">
                        <span>{service.name}</span>
                        <span className="font-black">${service.price}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {selectedServices.length > 0 && (
              <div className="border-t-4 border-black pt-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-black uppercase tracking-widest">TOTAL DURATION</p>
                  <p className="font-black text-lg">{getTotalDuration()} MIN</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black uppercase tracking-widest">TOTAL PRICE</p>
                  <p className="text-4xl font-black">
                    ${calculateTotal()}
                  </p>
                </div>
              </div>
            )}
            
            {selectedDate && (
              <div className="border-t-4 border-black pt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-2">SELECTED DATE</p>
                <p className="font-black text-lg uppercase">
                  {new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {selectedSlot && (
              <div className="border-t-4 border-black pt-6">
                <p className="text-xs font-black uppercase tracking-widest mb-2">SELECTED TIME</p>
                <p className="font-black text-lg uppercase">{selectedSlot}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}