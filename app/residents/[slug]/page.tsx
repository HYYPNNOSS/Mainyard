"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  enabled: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  response?: string;
}

interface ResidentProfile {
  id: string;
  slug: string;
  title: string;
  bio: string;
  description: string;
  location: string;
  yearsOfExperience: number;
  languages: string;
  certifications: string;
  price: number;
  bookingEnabled: boolean;
  instantBooking: boolean;
  cancellationPolicy: string;
  website: string;
  phone: string;
  socialLinks: string;
  user: {
    name: string;
    image: string;
    email: string;
  };
  images: Array<{ id: string; url: string }>;
  services: Service[];
  reviews: Review[];
  availabilities: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

// Helper function to safely parse JSON
function safeJSONParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}




export default function ResidentPublicProfile() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"about" | "services" | "reviews">("about");
  console.log(params.slug)

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`/api/residents/${params.slug}`);
        if (!response.ok) throw new Error("Profile not found");
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      loadProfile();
    }
  }, [params.slug]);
  console.log(params.slug)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The resident profile you're looking for doesn't exist.</p>
          <Link href="/residents" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Browse All Residents
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = profile.reviews.length > 0
    ? profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length
    : 0;

  const enabledServices = profile.services.filter(s => s.enabled);
  const servicesByCategory = enabledServices.reduce((acc, service) => {
    const category = service.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  // Safely parse JSON fields
  const certifications = safeJSONParse<string[]>(profile.certifications, []);
  const socialLinks = safeJSONParse<Array<{ platform: string; url: string }>>(profile.socialLinks, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {profile.user.image ? (
                    <img
                      src={profile.user.image}
                      alt={profile.user.name}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                      <span className="text-5xl text-blue-600 font-bold">
                        {profile.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{profile.user.name}</h1>
                  {profile.title && (
                    <p className="text-xl text-blue-100 mb-4">{profile.title}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {avgRating > 0 && (
                      <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                        <svg className="w-5 h-5 text-yellow-300 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="ml-1 text-blue-100">({profile.reviews.length} reviews)</span>
                      </div>
                    )}

                    {profile.location && (
                      <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile.location}
                      </div>
                    )}

                    {profile.yearsOfExperience && (
                      <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {profile.yearsOfExperience} years experience
                      </div>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-blue-50 text-lg leading-relaxed">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-xl p-6 sticky top-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm mb-2">Starting from</p>
                  <p className="text-4xl font-bold text-blue-600">${profile.price}</p>
                  <p className="text-gray-500 text-sm">per hour</p>
                </div>

                {profile.bookingEnabled ? (
                  <button
                    onClick={() => router.push(`/book/${profile.slug}`)}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg mb-3"
                  >
                    Book Now
                  </button>
                ) : (
                  <div className="w-full bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-semibold text-center mb-3">
                    Bookings Unavailable
                  </div>
                )}

                {profile.instantBooking && (
                  <div className="flex items-center justify-center text-green-600 text-sm mb-4">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Instant Booking Available
                  </div>
                )}

                <div className="border-t pt-4 space-y-3">
                  {profile.phone && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}

                  {profile.languages && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <span className="text-sm">{profile.languages}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === "about"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === "services"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Services ({enabledServices.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reviews ({profile.reviews.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Tab */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {profile.description && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4">About Me</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.description}</p>
                </div>
              )}

              {/* Availability */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Availability</h2>
                {profile.availabilities && profile.availabilities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.availabilities.map((avail) => {
                      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                      return (
                        <div key={avail.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-semibold text-gray-900">{days[avail.dayOfWeek]}</span>
                          <span className="text-gray-600">{avail.startTime} - {avail.endTime}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">Contact for availability</p>
                )}
              </div>

              {/* Cancellation Policy */}
              {profile.cancellationPolicy && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-4">Cancellation Policy</h2>
                  <p className="text-gray-700 leading-relaxed">{profile.cancellationPolicy}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Certifications */}
              {certifications.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Certifications</h3>
                  <div className="space-y-3">
                    {certifications.map((cert: string, idx: number) => (
                      <div key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {profile.images && profile.images.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Gallery</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {profile.images.map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt="Gallery"
                        className="w-full h-32 object-cover rounded-lg hover:opacity-75 transition cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Connect</h3>
                  <div className="space-y-2">
                    {socialLinks.map((link: { platform: string; url: string }, idx: number) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700"
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div>
            {enabledServices.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">No services available at this time</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(servicesByCategory).map(([category, services]) => (
                  <div key={category} className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-6">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                          onClick={() => setSelectedService(service.id)}
                        >
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                          {service.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">{service.duration} minutes</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-blue-600">${service.price}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/book/${profile.slug}?service=${service.id}`);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                              >
                                Book
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center md:border-r border-gray-200">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${i < Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600">{profile.reviews.length} total reviews</p>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = profile.reviews.filter((r) => r.rating === rating).length;
                    const percentage = profile.reviews.length > 0 ? (count / profile.reviews.length) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center">
                        <span className="text-sm text-gray-600 w-12">{rating} star</span>
                        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {profile.reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p className="text-gray-600">No reviews yet</p>
                <p className="text-gray-500 text-sm mt-2">Be the first to leave a review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {(review.customer.name || review.customer.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900">{review.customer.name || "Anonymous"}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    {review.response && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Response from {profile.user.name}</p>
                        <p className="text-sm text-blue-800">{review.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}