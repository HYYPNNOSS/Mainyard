"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getResidentProfile } from "@/server/actions/residentActions";
import { getResidentBookings } from "@/server/actions/bookingActions";

export default function ResidentDashboard() {
 

  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    avgRating: 0,
    reviewCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (status === "authenticated" && session?.user?.role !== "RESIDENT") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const profileData = await getResidentProfile();
        
        console.log("Setting profile data:", profileData);
        console.log("Services to set:", profileData?.services);
        
        setProfile(profileData);
        
        // Set services and reviews immediately from profile data
        setServices(profileData?.services || []);
        setReviews(profileData?.reviews || []);
        setCategories(profileData?.categories || []); // ADD THIS
        setProducts(profileData?.products || []); // ADD THIS
        // Only fetch bookings if profile exists
        if (profileData) {
          const bookingsData = await getResidentBookings(session?.user?.id || "");
          setBookings(bookingsData);
          
          // Calculate stats
          const totalEarnings = bookingsData
            .filter((b: any) => b.payment?.status === "COMPLETED")
            .reduce((sum: number, b: any) => sum + (b.payment?.residentEarnings || 0), 0);
          
          const avgRating = profileData?.reviews?.length > 0
            ? profileData.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / profileData.reviews.length
            : 0;
          
          setStats({
            totalEarnings,
            avgRating,
            reviewCount: profileData?.reviews?.length || 0
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);


  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  console.log(profile)

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome to Your Resident Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Let's get started by creating your professional profile. This will help customers find and book your services.
          </p>
          <Link href="/dashboard/resident/setup" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Create Your Profile
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "profile", label: "Profile", icon: "👤" },
    
    // Show categories for all business types
    { id: "categories", label: "Categories", icon: "📁", count: profile?.categories?.length || 0 },
    
    // Conditionally show services tab
    ...(profile?.businessType !== "PRODUCTS" ? [{
      id: "services", 
      label: "Services", 
      icon: "🛎️", 
      count: services.length 
    }] : []),
    
    // Conditionally show products tab
    ...(profile?.businessType !== "SERVICES" ? [{
      id: "products", 
      label: "Products", 
      icon: "🛍️", 
      count: profile?.products?.length || 0 
    }] : []),
    
    { id: "bookings", label: "Bookings", icon: "📅", count: bookings.length },
    { id: "reviews", label: "Reviews", icon: "⭐", count: reviews.length },
    { id: "earnings", label: "Earnings", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resident Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your profile, services, and bookings</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/resident/${profile.slug}`} target="_blank" className="text-blue-600 hover:text-blue-700 font-medium">
                View Public Profile →
              </Link>
              {/* <button onClick={() => signOut()} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                Sign Out
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {!profile.approved && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your profile is pending approval. You'll be notified once it's reviewed and activated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      ${stats.totalEarnings.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{bookings.length}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Average Rating</p>
                    <p className="text-3xl font-bold text-yellow-500 mt-2">
                      {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
                    </p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Active Services</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {services.filter(s => s.enabled).length}
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/resident/services/new" className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Add New Service</p>
                    <p className="text-sm text-gray-500">Create a new offering</p>
                  </div>
                </Link>

                <Link href="/dashboard/resident/availability" className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Update Availability</p>
                    <p className="text-sm text-gray-500">Manage your schedule</p>
                  </div>
                </Link>

                <Link href="/dashboard/resident/edit" className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Edit Profile</p>
                    <p className="text-sm text-gray-500">Update your information</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Recent Bookings</h3>
                <button onClick={() => setActiveTab("bookings")} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </button>
              </div>
              {bookings.slice(0, 5).length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.customer.name || booking.customer.email}</p>
                          <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                        booking.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Profile Information</h2>
                  <Link href="/dashboard/resident/edit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Edit Profile
                  </Link>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{session?.user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{session?.user?.email}</p>
                    </div>
                  </div>

                  {profile.title && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                      <p className="text-gray-900">{profile.title}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <p className="text-gray-700">{profile.bio || "Not set"}</p>
                  </div>

                  {profile.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                      <p className="text-gray-700">{profile.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {profile.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <p className="text-gray-900">{profile.location}</p>
                      </div>
                    )}
                    {profile.yearsOfExperience && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                        <p className="text-gray-900">{profile.yearsOfExperience} years</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Hourly Rate</label>
                    <p className="text-3xl font-bold text-blue-600">${profile.price}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
                      <p className="flex items-center">
                        {profile.bookingEnabled ? (
                          <span className="text-green-600 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Accepting bookings
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Not accepting bookings
                          </span>
                          )}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Status</label>
                          <p className="flex items-center">
                            {profile.approved ? (
                              <span className="text-green-600 font-semibold flex items-center">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Approved
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-semibold flex items-center">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Pending approval
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
    
                  {/* Skills & Certifications */}
                  {(profile.skills?.length > 0 || profile.certifications?.length > 0) && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-xl font-bold mb-4">Skills & Certifications</h3>
                      
                      {profile.skills?.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill: string, index: number) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
    
                      {profile.certifications?.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                          <div className="flex flex-wrap gap-2">
                            {profile.certifications.map((cert: string, index: number) => (
                              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
    
                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4">Profile Completion</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Basic Info", completed: !!profile.title && !!profile.bio },
                        { label: "Profile Photo", completed: !!profile.photoUrl },
                        { label: "Services", completed: services.length > 0 },
                        { label: "Availability", completed: !!profile.availability },
                        { label: "Skills", completed: profile.skills?.length > 0 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{item.label}</span>
                          {item.completed ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
    
                  {profile.photoUrl && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-bold mb-4">Profile Photo</h3>
                      <img src={profile.photoUrl} alt="Profile" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            )}
    
            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Services</h2>
                  <Link href="/dashboard/resident/services/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                    + Add New Service
                  </Link>
                </div>
    
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                        {service.images?.[0] && (
                          <img src={service.images[0]} alt={service.name} className="w-full h-48 object-cover rounded-t-lg" />
                        )}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                              {service.category && (
  <p className="text-sm text-gray-500">{service.category.name}</p>
)}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              service.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {service.enabled ? "Active" : "Inactive"}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">${service.price}</p>
                              <p className="text-sm text-gray-500">per {service.duration} min</p>
                            </div>
                          </div>
    
                          <div className="flex space-x-2">
                            <Link href={`/dashboard/resident/services/${service.id}/edit`} className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-center font-medium">
                              Edit
                            </Link>
                            <button className="flex-1 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Services Yet</h3>
                    <p className="text-gray-600 mb-6">Create your first service to start receiving bookings</p>
                    <Link href="/dashboard/resident/services/new" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                      Create First Service
                    </Link>
                  </div>
                )}
              </div>
            )}
    
    {/* Products Tab */}
{activeTab === "products" && profile?.businessType !== "SERVICES" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Your Products</h2>
      <Link 
        href="/dashboard/resident/products/new" 
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
      >
        + Add New Product
      </Link>
    </div>

    {products.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
            {product.images?.[0] && (
              <img src={product.images[0].url} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  {product.category && (
                    <p className="text-sm text-gray-500">{product.category.name}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {product.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                  {product.trackInventory && (
                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Link 
                  href={`/dashboard/resident/products/${product.id}/edit`} 
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-center font-medium"
                >
                  Edit
                </Link>
                <button className="flex-1 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🛍️</span>
        </div>
        <h3 className="text-xl font-bold mb-2">No Products Yet</h3>
        <p className="text-gray-600 mb-6">Create your first product to start selling</p>
        <Link 
          href="/dashboard/resident/products/new" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Create First Product
        </Link>
      </div>
    )}
  </div>
)}
            {/* Bookings Tab */}
            {/* Categories Tab */}
{activeTab === "categories" && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Your Categories</h2>
      <Link 
        href="/dashboard/resident/categories/new" 
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
      >
        + Add New Category
      </Link>
    </div>

    {categories.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{category.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                category.type === 'SERVICE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {category.type}
              </span>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            )}
            <div className="flex gap-2">
              <Link 
                href={`/dashboard/resident/categories/${category.id}/edit`}
                className="flex-1 text-center bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 text-sm font-medium"
              >
                Edit
              </Link>
              <button className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📁</span>
        </div>
        <h3 className="text-xl font-bold mb-2">No Categories Yet</h3>
        <p className="text-gray-600 mb-6">Create categories to organize your {
          profile?.businessType === 'SERVICES' ? 'services' : 
          profile?.businessType === 'PRODUCTS' ? 'products' : 
          'services and products'
        }</p>
        <Link 
          href="/dashboard/resident/categories/new" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Create First Category
        </Link>
      </div>
    )}
  </div>
)}


            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">All Bookings</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      All
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      Pending
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      Confirmed
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      Completed
                    </button>
                  </div>
                </div>
    
                {bookings.length > 0 ? (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {booking.customer.name?.[0] || booking.customer.email[0].toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.customer.name || "Guest"}
                                  </div>
                                  <div className="text-sm text-gray-500">{booking.customer.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{booking.service?.title || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                              <div className="text-sm text-gray-500">{booking.timeSlot}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                ${booking.payment?.residentEarnings?.toFixed(2) || "0.00"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                                booking.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                                booking.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                              {booking.status === "PENDING" && (
                                <>
                                  <button className="text-green-600 hover:text-green-900 mr-3">Accept</button>
                                  <button className="text-red-600 hover:text-red-900">Decline</button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
                    <p className="text-gray-600">Your bookings will appear here once customers start booking your services</p>
                  </div>
                )}
              </div>
            )}
    
            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
    
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <span className="text-blue-600 font-semibold text-lg">
                                {review.customer.name?.[0] || review.customer.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{review.customer.name || "Guest"}</h4>
                              <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600">Customer reviews will appear here after completed bookings</p>
                  </div>
                )}
              </div>
            )}
    
            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Earnings Overview</h2>
    
                {/* Earnings Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Earnings</h3>
                    <p className="text-3xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">Lifetime earnings</p>
                  </div>
    
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      ${bookings
                        .filter(b => 
                          b.payment?.status === "COMPLETED" && 
                          new Date(b.date).getMonth() === new Date().getMonth()
                        )
                        .reduce((sum, b) => sum + (b.payment?.residentEarnings || 0), 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Current month earnings</p>
                  </div>
    
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Average per Booking</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      ${bookings.length > 0 
                        ? (stats.totalEarnings / bookings.filter(b => b.payment?.status === "COMPLETED").length || 0).toFixed(2)
                        : "0.00"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Average earning</p>
                  </div>
                </div>
    
                {/* Transaction History */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold">Transaction History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings
                          .filter(b => b.payment)
                          .map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(booking.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.customer.name || booking.customer.email}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {booking.service?.title || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                ${booking.payment?.residentEarnings?.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  booking.payment?.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                                  booking.payment?.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {booking.payment?.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }