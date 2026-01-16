"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { getAvailableSlots, createBooking } from "@/server/actions/bookingActions";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface BookingPageProps {
  params: Promise<{ residentId: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [residentId, setResidentId] = useState("");
  const [resident, setResident] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [bookingCreated, setBookingCreated] = useState(false);

  useEffect(() => {
    async function init() {
      const { residentId: id } = await params;
      setResidentId(id);

      try {
        // FIXED: Changed from /api/resident/${id} to /api/residents/${id}
        const response = await fetch(`/api/residents/${id}`);
        
        if (!response.ok) {
          console.error("Failed to fetch resident:", response.status, response.statusText);
          router.push("/residents");
          return;
        }
        
        const data = await response.json();
        console.log("Resident data loaded:", data);
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

  async function handleBooking() {
    if (!selectedDate || !selectedSlot) {
      alert("Please select a date and time slot");
      return;
    }

    try {
      const booking = await createBooking(residentId, selectedDate, selectedSlot);

      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          residentId,
          amount: resident.price,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Resident Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the resident you're trying to book.</p>
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

  if (bookingCreated && clientSecret) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Professional</p>
                <p className="font-semibold">{resident.user.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold">
                  {new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-semibold">{selectedSlot}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${resident.price}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Book {resident.user.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Select Date & Time</h2>

            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time Slot
                  </label>
                  {availableSlots.length === 0 ? (
                    <p className="text-gray-600">
                      No available slots for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-lg border-2 font-semibold transition-colors ${
                            selectedSlot === slot
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-200 hover:border-blue-300"
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
                disabled={!selectedDate || !selectedSlot}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Booking Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Professional</p>
              <p className="font-semibold">{resident.user.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Hourly Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                ${resident.price}
              </p>
            </div>
            {selectedDate && (
              <div>
                <p className="text-gray-600">Selected Date</p>
                <p className="font-semibold">
                  {new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {selectedSlot && (
              <div>
                <p className="text-gray-600">Selected Time</p>
                <p className="font-semibold">{selectedSlot}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}