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
  const [price, setPrice] = useState("50");
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
        price: parseFloat(price),
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-2">Create Your Resident Profile</h1>
      <p className="text-gray-600 mb-8">
        Set up your profile to start accepting bookings
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

<div>
  <label className="label">Business Type</label>
  <select
    value={businessType}
    onChange={(e) => setBusinessType(e.target.value as any)}
    className="input"
    required
  >
    <option value="SERVICES">Services (Bookable appointments)</option>
    <option value="PRODUCTS">Products (E-commerce store)</option>
    <option value="BOTH">Both Services & Products</option>
  </select>
  <p className="text-sm text-gray-600 mt-2">
    {businessType === "SERVICES" && "You'll be able to create bookable services and set your availability"}
    {businessType === "PRODUCTS" && "You'll be able to create products to sell with inventory management"}
    {businessType === "BOTH" && "You'll have access to both booking services and product management"}
  </p>
</div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="label">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input"
            rows={3}
            placeholder="Write a short bio about yourself"
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows={4}
            placeholder="Describe your services in detail"
            required
          />
        </div>

        <div>
          <label className="label">Hourly Rate ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
            min="0"
            step="0.01"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating Profile..." : "Create Profile"}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        After creating your profile, you'll need to set your availability and
        wait for admin approval before accepting bookings.
      </p>
    </div>
  );
}
