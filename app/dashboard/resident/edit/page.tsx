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
          setPrice(profileData.price.toString() || "");
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

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url } = await response.json();
      
      await addProfileImage(url);

      const updatedProfile = await getResidentProfile();
      setProfile(updatedProfile);
      setMessage("Image uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      setMessage("Failed to upload image");
    } finally {
      setUploading(false);
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center border-8 border-black p-12 bg-yellow-400">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-6"></div>
          <p className="text-black font-black uppercase tracking-widest text-lg">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 bg-white">
      <div className="border-8 border-black p-12 bg-black text-white mb-12">
        <h1 className="text-6xl font-black uppercase tracking-tight">EDIT PROFILE</h1>
      </div>

      {message && (
        <div
          className={`mb-8 p-6 border-8 border-black ${
            message.includes("successfully")
              ? "bg-white text-black"
              : "bg-yellow-400 text-black"
          }`}
        >
          <p className="font-black uppercase tracking-wide">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border-8 border-black p-8 space-y-8">
        {/* Profile Images Section */}
        <div>
          <label className="block text-sm font-black uppercase tracking-widest mb-6">PROFILE IMAGES</label>
          <div className="space-y-6">
            {/* Current Images Grid */}
            {profile?.images && profile.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {profile.images.map((image: any) => (
                  <div key={image.id} className="relative group">
                    <div className="relative aspect-square border-4 border-black overflow-hidden bg-gray-100">
                      <Image
                        src={image.url}
                        alt="Profile image"
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute top-3 right-3 bg-black text-white w-10 h-10 border-4 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-400 hover:text-black"
                      title="Remove image"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
                className={`inline-flex items-center px-6 py-4 border-4 border-black bg-white text-black font-black uppercase text-sm tracking-wider hover:bg-yellow-400 cursor-pointer transition-colors ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
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
                    UPLOADING...
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-1 mr-3 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    ADD IMAGE
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
              <p className="mt-3 text-sm font-bold uppercase tracking-wide text-black">
                PNG, JPG, GIF UP TO 5MB
              </p>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black pt-8">
          <label className="block text-sm font-black uppercase tracking-widest mb-4">BUSINESS TYPE</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value as any)}
            className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-bold text-black uppercase bg-white"
          >
            <option value="SERVICES">SERVICES ONLY</option>
            <option value="PRODUCTS">PRODUCTS ONLY</option>
            <option value="BOTH">BOTH SERVICES & PRODUCTS</option>
          </select>
          <p className="text-sm font-bold uppercase tracking-wide text-black mt-3 border-4 border-black bg-yellow-400 p-4">
            CHANGING THIS WILL AFFECT WHICH FEATURES YOU HAVE ACCESS TO
          </p>
        </div>

        <div className="border-t-4 border-black pt-8">
          <label className="block text-sm font-black uppercase tracking-widest mb-4">BIO</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-medium text-black resize-none"
            rows={4}
            placeholder="SHORT BIO ABOUT YOURSELF"
          />
        </div>

        <div className="border-t-4 border-black pt-8">
          <label className="block text-sm font-black uppercase tracking-widest mb-4">DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-medium text-black resize-none"
            rows={6}
            placeholder="DETAILED DESCRIPTION OF YOUR SERVICES"
          />
        </div>

        <div className="border-t-4 border-black pt-8">
          <label className="flex items-center gap-4 cursor-pointer p-4 border-4 border-black hover:bg-yellow-400 transition-colors">
            <input
              type="checkbox"
              checked={bookingEnabled}
              onChange={(e) => setBookingEnabled(e.target.checked)}
              className="w-6 h-6 border-4 border-black accent-black"
            />
            <span className="text-black font-black uppercase tracking-wider">ACCEPT BOOKINGS</span>
          </label>
        </div>

        <div className="flex gap-4 pt-8 border-t-4 border-black">
          <button 
            type="submit" 
            disabled={saving} 
            className="flex-1 bg-black text-white px-8 py-5 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-white text-black px-8 py-5 font-black uppercase tracking-wider hover:bg-gray-100 transition-colors border-4 border-black"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}