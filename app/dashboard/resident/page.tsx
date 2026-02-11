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
        
        setProfile(profileData);
        setServices(profileData?.services || []);
        setReviews(profileData?.reviews || []);
        setCategories(profileData?.categories || []);
        setProducts(profileData?.products || []);
        
        if (profileData) {
          const bookingsData = await getResidentBookings(session?.user?.id || "");
          setBookings(bookingsData);
          
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center border-8 border-black p-12 bg-yellow-400">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-6"></div>
          <p className="text-black font-black uppercase tracking-widest text-lg">LOADING YOUR DASHBOARD...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-yellow-400 border-8 border-black p-12 text-center">
          <div className="w-24 h-24 bg-black border-4 border-black flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">WELCOME TO YOUR RESIDENT DASHBOARD</h2>
          <p className="text-black mb-8 font-bold uppercase tracking-wide max-w-2xl mx-auto">
            LET'S GET STARTED BY CREATING YOUR PROFESSIONAL PROFILE /// THIS WILL HELP CUSTOMERS FIND AND BOOK YOUR SERVICES
          </p>
          <Link 
            href="/dashboard/resident/setup" 
            className="inline-block bg-black text-white px-10 py-5 font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            CREATE YOUR PROFILE
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "OVERVIEW", icon: "📊" },
    { id: "profile", label: "PROFILE", icon: "👤" },
    { id: "categories", label: "CATEGORIES", icon: "📁", count: profile?.categories?.length || 0 },
    ...(profile?.businessType !== "PRODUCTS" ? [{
      id: "services", 
      label: "SERVICES", 
      icon: "🛎️", 
      count: services.length 
    }] : []),
    ...(profile?.businessType !== "SERVICES" ? [{
      id: "products", 
      label: "PRODUCTS", 
      icon: "🛍️", 
      count: profile?.products?.length || 0 
    }] : []),
    { id: "bookings", label: "BOOKINGS", icon: "📅", count: bookings.length },
    { id: "reviews", label: "REVIEWS", icon: "⭐", count: reviews.length },
    { id: "earnings", label: "EARNINGS", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white border-b-8 border-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tight mb-3">RESIDENT DASHBOARD</h1>
              <p className="text-yellow-400 font-bold uppercase tracking-wider">MANAGE YOUR PROFILE /// SERVICES /// BOOKINGS</p>
            </div>
            <div className="flex items-center space-x-4">
            {profile.slug ? (
  <Link 
    href={`/resident/${profile.slug}`} 
    className="text-yellow-400 hover:text-white font-black uppercase tracking-wider border-4 border-yellow-400 hover:border-white px-6 py-3 transition-colors"
  >
    VIEW PUBLIC PROFILE →
  </Link>
) : (
  <span className="text-gray-400 font-black uppercase tracking-wider border-4 border-gray-400 px-6 py-3 cursor-not-allowed">
    NO SLUG SET
  </span>
)}

            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {!profile.approved && (
        <div className="bg-yellow-400 border-b-8 border-black">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <svg className="h-8 w-8 text-black flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" strokeWidth={2}>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-black font-black uppercase tracking-wide">
                YOUR PROFILE IS PENDING APPROVAL /// YOU'LL BE NOTIFIED ONCE IT'S REVIEWED AND ACTIVATED
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Tabs */}
        <div className="bg-white border-8 border-black mb-12">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-6 px-8 border-r-4 border-black last:border-r-0 font-black text-sm flex items-center gap-3 uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "bg-yellow-400 text-black"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-black text-white px-3 py-1 font-black text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border-8 border-black p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest">TOTAL EARNINGS</p>
                  <div className="bg-black p-3">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-black">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
              </div>

              <div className="bg-white border-8 border-black p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest">TOTAL BOOKINGS</p>
                  <div className="bg-black p-3">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-black">{bookings.length}</p>
              </div>

              <div className="bg-white border-8 border-black p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest">AVG RATING</p>
                  <div className="bg-black p-3">
                    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-black">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
                </p>
              </div>

              <div className="bg-white border-8 border-black p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest">ACTIVE SERVICES</p>
                  <div className="bg-black p-3">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-black">
                  {services.filter(s => s.enabled).length}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border-8 border-black p-8">
              <h3 className="text-3xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-4">QUICK ACTIONS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link 
                  href="/dashboard/resident/services/new" 
                  className="flex items-center p-6 border-4 border-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <svg className="w-12 h-12 text-black mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight">ADD NEW SERVICE</p>
                    <p className="text-sm font-bold uppercase tracking-wide mt-1">CREATE A NEW OFFERING</p>
                  </div>
                </Link>

                <Link 
                  href="/dashboard/resident/availability" 
                  className="flex items-center p-6 border-4 border-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <svg className="w-12 h-12 text-black mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight">UPDATE AVAILABILITY</p>
                    <p className="text-sm font-bold uppercase tracking-wide mt-1">MANAGE YOUR SCHEDULE</p>
                  </div>
                </Link>

                <Link 
                  href="/dashboard/resident/edit" 
                  className="flex items-center p-6 border-4 border-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <svg className="w-12 h-12 text-black mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight">EDIT PROFILE</p>
                    <p className="text-sm font-bold uppercase tracking-wide mt-1">UPDATE YOUR INFORMATION</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white border-8 border-black p-8">
              <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                <h3 className="text-3xl font-black uppercase tracking-tight">RECENT BOOKINGS</h3>
                <button 
                  onClick={() => setActiveTab("bookings")} 
                  className="text-black font-black uppercase tracking-wider hover:text-yellow-400 transition-colors border-4 border-black hover:border-yellow-400 px-6 py-3"
                >
                  VIEW ALL →
                </button>
              </div>
              {bookings.slice(0, 5).length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-6 border-4 border-black bg-white hover:bg-yellow-400 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-black p-4">
                          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight">{booking.customer.name || booking.customer.email}</p>
                          <p className="text-sm font-bold uppercase tracking-wide">{new Date(booking.date).toLocaleDateString()} /// {booking.timeSlot}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 font-black text-xs uppercase tracking-widest border-4 border-black ${
                        booking.status === "CONFIRMED" ? "bg-white text-black" :
                        booking.status === "CANCELLED" ? "bg-black text-white" :
                        "bg-yellow-400 text-black"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-4 border-black bg-yellow-400">
                  <p className="text-black font-black uppercase tracking-wider text-xl">NO BOOKINGS YET</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab - Continue with similar brutal styling... */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border-8 border-black p-8">
                <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-6">
                  <h2 className="text-4xl font-black uppercase tracking-tight">PROFILE INFORMATION</h2>
                  <Link 
                    href="/dashboard/resident/edit" 
                    className="bg-black text-white px-6 py-3 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black"
                  >
                    EDIT PROFILE
                  </Link>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-2">NAME</label>
                      <p className="text-xl font-black">{session?.user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-2">EMAIL</label>
                      <p className="text-xl font-black break-all">{session?.user?.email}</p>
                    </div>
                  </div>

                  {profile.title && (
                    <div className="border-t-4 border-black pt-6">
                      <label className="block text-xs font-black uppercase tracking-widest mb-2">PROFESSIONAL TITLE</label>
                      <p className="text-2xl font-black uppercase">{profile.title}</p>
                    </div>
                  )}

                  <div className="border-t-4 border-black pt-6">
                    <label className="block text-xs font-black uppercase tracking-widest mb-2">BIO</label>
                    <p className="text-base font-medium">{profile.bio || "NOT SET"}</p>
                  </div>

                  {profile.description && (
                    <div className="border-t-4 border-black pt-6">
                      <label className="block text-xs font-black uppercase tracking-widest mb-2">DETAILED DESCRIPTION</label>
                      <p className="text-base font-medium">{profile.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6 border-t-4 border-black pt-6">
                    {profile.location && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">LOCATION</label>
                        <p className="text-xl font-black">{profile.location}</p>
                      </div>
                    )}
                    {profile.yearsOfExperience && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">EXPERIENCE</label>
                        <p className="text-xl font-black">{profile.yearsOfExperience} YEARS</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t-4 border-black pt-6">
                    <label className="block text-xs font-black uppercase tracking-widest mb-3">BASE HOURLY RATE</label>
                    <p className="text-6xl font-black">${profile.price}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 border-t-4 border-black pt-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-3">BOOKING STATUS</label>
                      <p className="flex items-center gap-2">
                        {profile.bookingEnabled ? (
                          <span className="bg-white text-black border-4 border-black px-4 py-2 font-black uppercase text-sm tracking-wider flex items-center gap-2">
                            ✓ ACCEPTING BOOKINGS
                          </span>
                        ) : (
                          <span className="bg-black text-white border-4 border-black px-4 py-2 font-black uppercase text-sm tracking-wider flex items-center gap-2">
                            ✗ NOT ACCEPTING
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest mb-3">PROFILE STATUS</label>
                      <p className="flex items-center gap-2">
                        {profile.approved ? (
                          <span className="bg-white text-black border-4 border-black px-4 py-2 font-black uppercase text-sm tracking-wider flex items-center gap-2">
                            ✓ APPROVED
                          </span>
                        ) : (
                          <span className="bg-yellow-400 text-black border-4 border-black px-4 py-2 font-black uppercase text-sm tracking-wider flex items-center gap-2">
                            ⏱ PENDING
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Certifications */}
              {(profile.skills?.length > 0 || profile.certifications?.length > 0) && (
                <div className="bg-white border-8 border-black p-8">
                  <h3 className="text-3xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-4">SKILLS & CERTIFICATIONS</h3>
                  
                  {profile.skills?.length > 0 && (
                    <div className="mb-8">
                      <label className="block text-xs font-black uppercase tracking-widest mb-4">SKILLS</label>
                      <div className="flex flex-wrap gap-3">
                        {profile.skills.map((skill: string, index: number) => (
                          <span key={index} className="bg-white text-black px-4 py-2 border-4 border-black font-black uppercase text-sm tracking-wide">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.certifications?.length > 0 && (
                    <div className="border-t-4 border-black pt-8">
                      <label className="block text-xs font-black uppercase tracking-widest mb-4">CERTIFICATIONS</label>
                      <div className="flex flex-wrap gap-3">
                        {profile.certifications.map((cert: string, index: number) => (
                          <span key={index} className="bg-yellow-400 text-black px-4 py-2 border-4 border-black font-black uppercase text-sm tracking-wide">
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
            <div className="space-y-8">
              <div className="bg-white border-8 border-black p-8">
                <h3 className="text-2xl font-black mb-6 uppercase tracking-tight border-b-4 border-black pb-4">PROFILE COMPLETION</h3>
                <div className="space-y-4">
                  {[
                    { label: "BASIC INFO", completed: !!profile.title && !!profile.bio },
                    { label: "PROFILE PHOTO", completed: !!profile.photoUrl },
                    { label: "SERVICES", completed: services.length > 0 },
                    { label: "AVAILABILITY", completed: !!profile.availability },
                    { label: "SKILLS", completed: profile.skills?.length > 0 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border-4 border-black">
                      <span className="text-sm font-black uppercase tracking-wide">{item.label}</span>
                      {item.completed ? (
                        <span className="bg-black text-white px-3 py-1 font-black text-xs">✓</span>
                      ) : (
                        <span className="bg-white border-2 border-black px-3 py-1 font-black text-xs">○</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {profile.photoUrl && (
                <div className="bg-white border-8 border-black p-8">
                  <h3 className="text-2xl font-black mb-6 uppercase tracking-tight border-b-4 border-black pb-4">PROFILE PHOTO</h3>
                  <img src={profile.photoUrl} alt="Profile" className="w-full h-64 object-cover border-4 border-black grayscale" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-5xl font-black uppercase tracking-tight">YOUR SERVICES</h2>
              <Link 
                href="/dashboard/resident/services/new" 
                className="bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                + ADD NEW SERVICE
              </Link>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service) => (
                  <div key={service.id} className="bg-white border-8 border-black overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                    {service.images?.[0] && (
                      <img src={service.images[0]} alt={service.name} className="w-full h-56 object-cover border-b-8 border-black grayscale" />
                    )}
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6 border-b-4 border-black pb-4">
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-tight">{service.name}</h3>
                          {service.category && (
                            <p className="text-sm font-bold uppercase tracking-wide mt-2">{service.category.name}</p>
                          )}
                        </div>
                        <span className={`px-4 py-2 font-black text-xs uppercase tracking-widest border-4 border-black ${
                          service.enabled ? "bg-white text-black" : "bg-black text-white"
                        }`}>
                          {service.enabled ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium mb-6">{service.description}</p>
                      
                      <div className="flex items-center justify-between mb-6 border-t-4 border-black pt-4">
                        <div>
                          <p className="text-4xl font-black">${service.price}</p>
                          <p className="text-sm font-bold uppercase tracking-wide">PER {service.duration} MIN</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Link 
                          href={`/dashboard/resident/services/${service.id}/edit`} 
                          className="flex-1 bg-white text-black px-6 py-3 border-4 border-black hover:bg-yellow-400 transition-colors text-center font-black uppercase tracking-wide"
                        >
                          EDIT
                        </Link>
                        <button className="flex-1 bg-black text-white px-6 py-3 border-4 border-black hover:bg-yellow-400 hover:text-black transition-colors font-black uppercase tracking-wide">
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-400 border-8 border-black p-16 text-center">
                <div className="w-24 h-24 bg-black flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">NO SERVICES YET</h3>
                <p className="text-black mb-8 font-bold uppercase tracking-wide">CREATE YOUR FIRST SERVICE TO START RECEIVING BOOKINGS</p>
                <Link 
                  href="/dashboard/resident/services/new" 
                  className="inline-block bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  CREATE FIRST SERVICE
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && profile?.businessType !== "SERVICES" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-5xl font-black uppercase tracking-tight">YOUR PRODUCTS</h2>
              <Link 
                href="/dashboard/resident/products/new" 
                className="bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                + ADD NEW PRODUCT
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border-8 border-black overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                    {product.images?.[0] && (
                      <img src={product.images[0].url} alt={product.name} className="w-full h-56 object-cover border-b-8 border-black grayscale" />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4 border-b-4 border-black pb-4">
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">{product.name}</h3>
                          {product.category && (
                            <p className="text-sm font-bold uppercase tracking-wide mt-1">{product.category.name}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1.5 font-black text-xs uppercase tracking-widest border-4 border-black ${
                          product.enabled ? "bg-white text-black" : "bg-black text-white"
                        }`}>
                          {product.enabled ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium mb-4">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-6 border-t-4 border-black pt-4">
                        <div>
                          <p className="text-3xl font-black">${product.price}</p>
                          {product.trackInventory && (
                            <p className="text-sm font-bold uppercase tracking-wide">STOCK: {product.stock}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link 
                          href={`/dashboard/resident/products/${product.id}/edit`} 
                          className="flex-1 bg-white text-black px-4 py-2.5 border-4 border-black hover:bg-yellow-400 transition-colors text-center font-black uppercase text-sm tracking-wide"
                        >
                          EDIT
                        </Link>
                        <button className="flex-1 bg-black text-white px-4 py-2.5 border-4 border-black hover:bg-yellow-400 hover:text-black transition-colors font-black uppercase text-sm tracking-wide">
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-400 border-8 border-black p-16 text-center">
                <div className="text-6xl mb-8">🛍️</div>
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">NO PRODUCTS YET</h3>
                <p className="text-black mb-8 font-bold uppercase tracking-wide">CREATE YOUR FIRST PRODUCT TO START SELLING</p>
                <Link 
                  href="/dashboard/resident/products/new" 
                  className="inline-block bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  CREATE FIRST PRODUCT
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-5xl font-black uppercase tracking-tight">YOUR CATEGORIES</h2>
              <Link 
                href="/dashboard/resident/categories/new" 
                className="bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                + ADD NEW CATEGORY
              </Link>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border-8 border-black p-6">
                    <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-4">
                      <h3 className="text-xl font-black uppercase tracking-tight">{category.name}</h3>
                      <span className={`px-3 py-1 font-black text-xs uppercase tracking-widest border-4 border-black ${
                        category.type === 'SERVICE' ? 'bg-white text-black' : 'bg-yellow-400 text-black'
                      }`}>
                        {category.type}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm font-medium mb-6">{category.description}</p>
                    )}
                    <div className="flex gap-3">
                      <Link 
                        href={`/dashboard/resident/categories/${category.id}/edit`}
                        className="flex-1 text-center bg-white text-black px-4 py-2.5 border-4 border-black hover:bg-yellow-400 transition-colors font-black uppercase text-sm tracking-wide"
                      >
                        EDIT
                      </Link>
                      <button className="flex-1 bg-black text-white px-4 py-2.5 border-4 border-black hover:bg-yellow-400 hover:text-black transition-colors font-black uppercase text-sm tracking-wide">
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-400 border-8 border-black p-16 text-center">
                <div className="text-6xl mb-8">📁</div>
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">NO CATEGORIES YET</h3>
                <p className="text-black mb-8 font-bold uppercase tracking-wide">
                  CREATE CATEGORIES TO ORGANIZE YOUR {
                    profile?.businessType === 'SERVICES' ? 'SERVICES' : 
                    profile?.businessType === 'PRODUCTS' ? 'PRODUCTS' : 
                    'SERVICES AND PRODUCTS'
                  }
                </p>
                <Link 
                  href="/dashboard/resident/categories/new" 
                  className="inline-block bg-black text-white px-8 py-4 font-black uppercase tracking-wider hover:bg-white hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  CREATE FIRST CATEGORY
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Note: Bookings, Reviews, and Earnings tabs would continue with similar brutal styling */}
        {/* I'll add just the bookings tab as an example */}
        
        {activeTab === "bookings" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-5xl font-black uppercase tracking-tight">ALL BOOKINGS</h2>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-black text-white border-4 border-black font-black uppercase text-sm tracking-wider">
                  ALL
                </button>
                <button className="px-6 py-3 bg-white text-black border-4 border-black hover:bg-yellow-400 transition-colors font-black uppercase text-sm tracking-wider">
                  PENDING
                </button>
                <button className="px-6 py-3 bg-white text-black border-4 border-black hover:bg-yellow-400 transition-colors font-black uppercase text-sm tracking-wider">
                  CONFIRMED
                </button>
                <button className="px-6 py-3 bg-white text-black border-4 border-black hover:bg-yellow-400 transition-colors font-black uppercase text-sm tracking-wider">
                  COMPLETED
                </button>
              </div>
            </div>

            {bookings.length > 0 ? (
              <div className="bg-white border-8 border-black overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-black text-white border-b-8 border-black">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                        CUSTOMER
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                        SERVICE
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                        DATE & TIME
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                        AMOUNT
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest border-r-4 border-white">
                        STATUS
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b-4 border-black hover:bg-yellow-400 transition-colors">
                        <td className="px-6 py-4 border-r-4 border-black">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-black flex items-center justify-center">
                              <span className="text-yellow-400 font-black text-lg">
                                {booking.customer.name?.[0] || booking.customer.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-black uppercase tracking-tight">
                                {booking.customer.name || "GUEST"}
                              </div>
                              <div className="text-xs font-bold uppercase">{booking.customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r-4 border-black">
                          <div className="text-sm font-black uppercase">{booking.service?.title || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 border-r-4 border-black">
                          <div className="text-sm font-black uppercase">{new Date(booking.date).toLocaleDateString()}</div>
                          <div className="text-xs font-bold uppercase">{booking.timeSlot}</div>
                        </td>
                        <td className="px-6 py-4 border-r-4 border-black">
                          <div className="text-xl font-black">
                            ${booking.payment?.residentEarnings?.toFixed(2) || "0.00"}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r-4 border-black">
                          <span className={`px-4 py-2 inline-flex font-black text-xs uppercase tracking-widest border-4 border-black ${
                            booking.status === "CONFIRMED" ? "bg-white text-black" :
                            booking.status === "COMPLETED" ? "bg-yellow-400 text-black" :
                            booking.status === "CANCELLED" ? "bg-black text-white" :
                            "bg-yellow-400 text-black"
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-black font-black uppercase text-xs tracking-wider hover:text-yellow-400 border-b-2 border-black hover:border-yellow-400 mr-3">
                            VIEW
                          </button>
                          {booking.status === "PENDING" && (
                            <>
                              <button className="text-black font-black uppercase text-xs tracking-wider hover:text-yellow-400 border-b-2 border-black hover:border-yellow-400 mr-3">
                                ACCEPT
                              </button>
                              <button className="text-black font-black uppercase text-xs tracking-wider hover:text-yellow-400 border-b-2 border-black hover:border-yellow-400">
                                DECLINE
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-yellow-400 border-8 border-black p-16 text-center">
                <div className="w-24 h-24 bg-black flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">NO BOOKINGS YET</h3>
                <p className="text-black font-bold uppercase tracking-wide">YOUR BOOKINGS WILL APPEAR HERE ONCE CUSTOMERS START BOOKING YOUR SERVICES</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}