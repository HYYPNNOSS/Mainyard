"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createResidentProfile } from "@/server/actions/residentActions";

export default function ResidentSetupPage() {
  const { data: session } = useSession();
  const [businessType, setBusinessType] = useState<"SERVICES" | "PRODUCTS" | "BOTH">("SERVICES");
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createResidentProfile({
        bio,
        description,
        businessType
      });

      router.push("/dashboard/resident");
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 bg-white">
      <div className="border-8 border-black p-12 bg-white mb-8">
        <h1 className="text-6xl font-black mb-6 uppercase tracking-tight leading-tight">
          CREATE YOUR RESIDENT PROFILE
        </h1>
        <p className="text-black font-bold uppercase tracking-wide text-lg">
          SET UP YOUR PROFILE TO START ACCEPTING BOOKINGS
        </p>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-yellow-400 border-8 border-black">
          <p className="text-black font-black uppercase tracking-wide">{error}</p>
        </div>
      )}

      <div className="bg-white border-8 border-black p-8 mb-8">
        <label className="block text-sm font-black uppercase tracking-widest mb-4">BUSINESS TYPE</label>
        <select
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value as any)}
          className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-bold text-black uppercase text-base bg-white"
          required
        >
          <option value="SERVICES">SERVICES (BOOKABLE APPOINTMENTS)</option>
          <option value="PRODUCTS">PRODUCTS (E-COMMERCE STORE)</option>
          <option value="BOTH">BOTH SERVICES & PRODUCTS</option>
        </select>
        <div className="mt-6 p-4 border-4 border-black bg-yellow-400">
          <p className="text-sm font-bold uppercase tracking-wide text-black">
            {businessType === "SERVICES" && "YOU'LL BE ABLE TO CREATE BOOKABLE SERVICES AND SET YOUR AVAILABILITY"}
            {businessType === "PRODUCTS" && "YOU'LL BE ABLE TO CREATE PRODUCTS TO SELL WITH INVENTORY MANAGEMENT"}
            {businessType === "BOTH" && "YOU'LL HAVE ACCESS TO BOTH BOOKING SERVICES AND PRODUCT MANAGEMENT"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-8 border-black p-8 space-y-8">
        <div>
          <label className="block text-sm font-black uppercase tracking-widest mb-4">BIO</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-medium text-black resize-none"
            rows={4}
            placeholder="WRITE A SHORT BIO ABOUT YOURSELF"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-black uppercase tracking-widest mb-4">DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-medium text-black resize-none"
            rows={6}
            placeholder="DESCRIBE YOUR SERVICES IN DETAIL"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-black text-white px-8 py-5 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? "CREATING PROFILE..." : "CREATE PROFILE"}
        </button>
      </form>

      <div className="mt-8 p-6 border-4 border-black bg-yellow-400 text-center">
        <p className="text-black font-bold uppercase tracking-wide leading-relaxed">
          AFTER CREATING YOUR PROFILE, YOU'LL NEED TO SET YOUR AVAILABILITY AND WAIT FOR ADMIN APPROVAL BEFORE ACCEPTING BOOKINGS.
        </p>
      </div>
    </div>
  );
}