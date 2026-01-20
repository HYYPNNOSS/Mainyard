"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  updateResidentProfile,
  getResidentProfile,
  addProfileImage,
  removeProfileImage,
} from "@/server/actions/residentActions";
import Image from "next/image";

export default function EditResidentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [businessType, setBusinessType] = useState<"SERVICES" | "PRODUCTS" | "BOTH">("SERVICES");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileData = await getResidentProfile();
        if (profileData) {
          setProfile(profileData);
          setBio(profileData.bio || "");
          setDescription(profileData.description || "");
          setPrice(profileData.price.toString());
          setBookingEnabled(profileData.bookingEnabled);
          setBusinessType(profileData.businessType); 
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      loadProfile();
    }
  }, [session?.user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await updateResidentProfile({
        bio,
        description,
        price: parseFloat(price),
        bookingEnabled,
        businessType,

      });
      setMessage("Profile updated successfully!");
      setTimeout(() => router.push("/dashboard/resident"), 2000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload to your image hosting service
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url } = await response.json();
      
      // Add image to database
      await addProfileImage(url);

      // Refresh profile data
      const updatedProfile = await getResidentProfile();
      setProfile(updatedProfile);
      setMessage("Image uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      setMessage("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  }

  async function handleRemoveImage(imageId: string) {
    if (!confirm("Are you sure you want to remove this image?")) return;

    try {
      await removeProfileImage(imageId);
      const updatedProfile = await getResidentProfile();
      setProfile(updatedProfile);
      setMessage("Image removed successfully!");
    } catch (error) {
      console.error("Failed to remove image:", error);
      setMessage("Failed to remove image");
    }
  }

  if (status === "loading" || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Edit Profile</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("successfully")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Profile Images Section */}
        <div>
          <label className="label">Profile Images</label>
          <div className="space-y-4">
            {/* Current Images Grid */}
            {profile?.images && profile.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.images.map((image: any) => (
                  <div key={image.id} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={image.url}
                        alt="Profile image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Remove image"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div>
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Image
                  </>
                )}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <p className="mt-2 text-sm text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>
        <div>
  <label className="label">Business Type</label>
  <select
    value={businessType}
    onChange={(e) => setBusinessType(e.target.value as any)}
    className="input"
  >
    <option value="SERVICES">Services Only</option>
    <option value="PRODUCTS">Products Only</option>
    <option value="BOTH">Both Services & Products</option>
  </select>
  <p className="text-sm text-gray-500 mt-1">
    Changing this will affect which features you have access to
  </p>
</div>
        <div>
          <label className="label">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input"
            rows={3}
            placeholder="Short bio about yourself"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows={4}
            placeholder="Detailed description of your services"
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

        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={bookingEnabled}
              onChange={(e) => setBookingEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Accept bookings</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}