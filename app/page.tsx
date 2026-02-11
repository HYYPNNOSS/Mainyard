"use client"
import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Star, MapPin, Award, Filter, Package, Calendar } from 'lucide-react';

export default function MainyardLanding() {
  const [residents, setResidents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [businessType, setBusinessType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const userRole = "CUSTOMER";
  const isResident = userRole === "RESIDENT";
  const isAdmin = userRole === "ADMIN";
  const isCustomer = !userRole || userRole === "CUSTOMER";

  useEffect(() => {
    if (isCustomer) {
      fetchResidents();
      fetchCategories();
    }
  }, [selectedCategory, businessType, searchQuery, isCustomer]);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (businessType !== 'all') params.append('businessType', businessType);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/residents?${params}`);
      const data = await response.json();
      setResidents(data.residents || []);
    } catch (error) {
      console.error('Error fetching residents:', error);
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        console.error('Categories API error:', response.status);
        setCategories([]);
        return;
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const getDashboardLink = () => {
    if (isResident) return "/dashboard/resident";
    if (isAdmin) return "/admin";
    return "/explore";
  };
  
  const getHeroContent = () => {
    if (isResident) {
      return {
        title: "YOUR MARKETPLACE DASHBOARD",
        description: "Manage your services, products, bookings, and orders all in one place.",
        cta: "GO TO DASHBOARD"
      };
    }
    if (isAdmin) {
      return {
        title: "PLATFORM ADMINISTRATION",
        description: "Oversee professionals, products, bookings, and ensure quality across the marketplace.",
        cta: "GO TO ADMIN PANEL"
      };
    }
    return {
      title: "DISCOVER LOCAL TALENT",
      description: "Book services and shop products from curated professionals in your community.",
      cta: "EXPLORE MARKETPLACE"
    };
  };
  
  const heroContent = getHeroContent();

  const getBusinessTypeLabel = (type) => {
    switch(type) {
      case 'SERVICES': return 'SERVICES';
      case 'PRODUCTS': return 'PRODUCTS';
      case 'BOTH': return 'SERVICES & PRODUCTS';
      default: return '';
    }
  };

  const testimonials = [
    {
      name: "SARAH JOHNSON",
      role: "WELLNESS COACH",
      text: "Openyard transformed how I run my business. I now offer both coaching sessions and wellness products in one place.",
      rating: 5
    },
    {
      name: "MICHAEL CHEN",
      role: "FITNESS PROFESSIONAL",
      text: "The platform makes it easy to manage bookings and sell my nutrition products. Everything I need in one dashboard.",
      rating: 5
    },
    {
      name: "EMMA DAVIS",
      role: "BEAUTY SPECIALIST",
      text: "My clients love being able to book appointments and purchase skincare products seamlessly.",
      rating: 5
    }
  ];

  const getFAQs = () => {
    if (isResident) {
      return [
        {
          q: "CAN I OFFER BOTH SERVICES AND PRODUCTS?",
          a: "Yes! You can choose to offer services only, products only, or both. Set your business type in your profile settings."
        },
        {
          q: "HOW DO PAYMENTS WORK?",
          a: "All payments are processed securely through Stripe. You receive earnings within 2-3 business days after a booking is completed or product is delivered."
        },
        {
          q: "CAN I CREATE CUSTOM CATEGORIES?",
          a: "Absolutely! You can create custom categories for both your services and products to help organize your offerings."
        },
        {
          q: "HOW DO I MANAGE INVENTORY?",
          a: "For products, you can enable inventory tracking, set stock levels, and receive low-stock alerts in your dashboard."
        }
      ];
    }
    return [
      {
        q: "WHAT CAN I FIND ON OPENYARD?",
        a: "You can book professional services like coaching, wellness sessions, consultations, and shop physical or digital products from local professionals."
      },
      {
        q: "HOW DO I BOOK A SERVICE?",
        a: "Browse professionals, select their service, check availability, and book directly. Payment is secure and processed automatically."
      },
      {
        q: "CAN I PURCHASE PRODUCTS TOO?",
        a: "Yes! Many professionals offer products alongside their services. Simply add items to your cart and checkout securely."
      },
      {
        q: "ARE ALL PROFESSIONALS VETTED?",
        a: "Every professional undergoes verification including credential checks and quality reviews before joining the platform."
      }
    ];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
  className={`relative pt-24 ${isCustomer ? "pb-12" : "pb-24"} px-6 border-b-8 border-black overflow-hidden`}
  style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1435575653489-b0873ec954e2?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  <div className="max-w-7xl mx-auto relative z-10">
    <div className="max-w-4xl">
      <h1 className="text-7xl md:text-8xl font-black text-white mb-8 leading-[0.9] uppercase tracking-tight">
        {heroContent.title}
      </h1>

      <p className="text-xl md:text-2xl text-white mb-12 leading-tight font-bold uppercase">
        {heroContent.description}
      </p>

      {!isCustomer && (
        <a
          href={getDashboardLink()}
          className="inline-flex items-center gap-4 bg-black text-white px-10 py-5 text-sm font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          {heroContent.cta}
          <ChevronRight size={20} strokeWidth={3} />
        </a>
      )}
    </div>
  </div>
</section>


      {/* Marketplace Browse Section */}
      {isCustomer && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Search and Filter */}
            <div className="mb-16 space-y-10">
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={24} strokeWidth={3} />
                <input
                  type="text"
                  placeholder="SEARCH PROFESSIONALS, SERVICES, OR PRODUCTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-white border-4 border-black focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow text-base font-bold uppercase placeholder:text-gray-400"
                />
              </div>

              {/* Filters */}
              <div className="space-y-8">
                {/* Business Type Filter */}
                <div className="flex items-start gap-6">
                  <span className="text-sm uppercase tracking-widest text-black font-black pt-3 min-w-[100px]">TYPE:</span>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setBusinessType('all')}
                      className={`px-6 py-3 text-sm font-black uppercase tracking-wider border-4 border-black transition-all ${
                        businessType === 'all'
                          ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setBusinessType('SERVICES')}
                      className={`px-6 py-3 text-sm font-black uppercase tracking-wider border-4 border-black transition-all flex items-center gap-2 ${
                        businessType === 'SERVICES'
                          ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <Calendar size={16} strokeWidth={3} />
                      SERVICES
                    </button>
                    <button
                      onClick={() => setBusinessType('PRODUCTS')}
                      className={`px-6 py-3 text-sm font-black uppercase tracking-wider border-4 border-black transition-all flex items-center gap-2 ${
                        businessType === 'PRODUCTS'
                          ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <Package size={16} strokeWidth={3} />
                      PRODUCTS
                    </button>
                  </div>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="flex items-start gap-6">
                    <span className="text-sm uppercase tracking-widest text-black font-black pt-3 min-w-[100px]">CATEGORY:</span>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-3 text-sm font-black uppercase tracking-wider border-4 border-black transition-all ${
                          selectedCategory === 'all'
                            ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        ALL
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-6 py-3 text-sm font-black uppercase tracking-wider border-4 border-black transition-all ${
                            selectedCategory === category.id
                              ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          {category.name.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professionals Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-100 h-[500px] animate-pulse border-4 border-black" />
                ))}
              </div>
            ) : residents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {residents.map((resident) => (
                  <a
                    key={resident.id}
                    href={`/resident/${resident.slug}`}
                    className="group bg-white border-4 border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-72 overflow-hidden bg-gray-100 border-b-4 border-black">
                      <img
                        src={resident.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop'}
                        alt={resident.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      {resident.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-black px-4 py-2 text-xs font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          FEATURED
                        </div>
                      )}
                      {resident.businessType && (
                        <div className="absolute bottom-4 left-4 bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-widest border-4 border-black">
                          {getBusinessTypeLabel(resident.businessType)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-black text-black mb-1 uppercase">
                        {resident.name}
                      </h3>
                      <p className="text-black text-sm mb-4 font-bold uppercase">{resident.title}</p>
                      
                      {resident.bio && (
                        <p className="text-gray-700 text-sm mb-5 line-clamp-2 leading-relaxed">
                          {resident.bio}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="space-y-2 mb-5 pb-5 border-b-2 border-black">
                        {resident.location && (
                          <div className="flex items-center gap-2 text-xs text-black font-bold uppercase">
                            <MapPin size={14} strokeWidth={3} />
                            <span>{resident.location}</span>
                          </div>
                        )}
                        {resident.yearsOfExperience && (
                          <div className="flex items-center gap-2 text-xs text-black font-bold uppercase">
                            <Award size={14} strokeWidth={3} />
                            <span>{resident.yearsOfExperience} YEARS</span>
                          </div>
                        )}
                        {resident.rating && (
                          <div className="flex items-center gap-2 text-xs text-black font-bold uppercase">
                            <Star size={14} fill="currentColor" strokeWidth={3} />
                            <span>{resident.rating} · {resident.reviewCount} REVIEWS</span>
                          </div>
                        )}
                      </div>

                      {/* Categories */}
                      {resident.categories && resident.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resident.categories.slice(0, 3).map((cat) => (
                            <span
                              key={cat.id}
                              className="px-3 py-1.5 bg-white text-black text-xs font-black uppercase tracking-wider border-2 border-black"
                            >
                              {cat.name.toUpperCase()}
                            </span>
                          ))}
                          {resident.categories.length > 3 && (
                            <span className="px-3 py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider border-2 border-black">
                              +{resident.categories.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-black font-black uppercase text-sm tracking-wider flex items-center gap-2">
                          VIEW PROFILE
                          <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border-8 border-black bg-yellow-400">
                <p className="text-3xl text-black mb-2 font-black uppercase">NO PROFESSIONALS FOUND</p>
                <p className="text-black font-bold uppercase tracking-wider">TRY ADJUSTING YOUR FILTERS</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      {isCustomer && (
        <section className="py-24 px-6 bg-black text-white border-y-8 border-black">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20">
              <h2 className="text-6xl md:text-7xl font-black mb-4 uppercase tracking-tight">HOW IT WORKS</h2>
              <p className="text-yellow-400 font-black uppercase tracking-widest text-lg">SIMPLE /// SECURE /// SEAMLESS</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="border-4 border-white p-8 bg-black hover:bg-yellow-400 hover:text-black transition-colors group">
                <div className="w-16 h-16 border-4 border-current flex items-center justify-center mb-6 text-2xl font-black">
                  01
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">BROWSE & DISCOVER</h3>
                <p className="leading-relaxed font-bold uppercase text-sm opacity-90">
                  EXPLORE CURATED PROFESSIONALS OFFERING SERVICES AND PRODUCTS TAILORED TO YOUR NEEDS.
                </p>
              </div>

              <div className="border-4 border-white p-8 bg-black hover:bg-yellow-400 hover:text-black transition-colors group">
                <div className="w-16 h-16 border-4 border-current flex items-center justify-center mb-6 text-2xl font-black">
                  02
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">BOOK OR PURCHASE</h3>
                <p className="leading-relaxed font-bold uppercase text-sm opacity-90">
                  SCHEDULE SERVICES AT CONVENIENT TIMES OR ADD PRODUCTS TO CART AND CHECKOUT SECURELY.
                </p>
              </div>

              <div className="border-4 border-white p-8 bg-black hover:bg-yellow-400 hover:text-black transition-colors group">
                <div className="w-16 h-16 border-4 border-current flex items-center justify-center mb-6 text-2xl font-black">
                  03
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">EXPERIENCE & ENJOY</h3>
                <p className="leading-relaxed font-bold uppercase text-sm opacity-90">
                  MEET FOR YOUR SERVICE OR RECEIVE YOUR PRODUCT. ALL PAYMENTS ARE PROCESSED AUTOMATICALLY.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-24 px-6 bg-yellow-400">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20">
            <h2 className="text-6xl md:text-7xl font-black mb-4 uppercase tracking-tight">WHAT PEOPLE SAY</h2>
            <p className="text-black font-black uppercase tracking-widest text-lg">REAL EXPERIENCES /// OUR COMMUNITY</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" strokeWidth={0} className="text-black" />
                  ))}
                </div>
                <p className="text-black mb-8 leading-relaxed font-medium">
                  {testimonial.text}
                </p>
                <div className="pt-6 border-t-4 border-black">
                  <div className="font-black text-black text-sm uppercase tracking-wider mb-1">{testimonial.name}</div>
                  <div className="text-xs text-black font-bold uppercase tracking-widest opacity-60">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white border-y-8 border-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black mb-20 uppercase tracking-tight">
            QUESTIONS & ANSWERS
          </h2>

          <div className="space-y-0">
            {getFAQs().map((faq, index) => (
              <details key={index} className="border-b-4 border-black py-8 group cursor-pointer">
                <summary className="font-black text-black flex items-center justify-between text-lg uppercase tracking-wide list-none">
                  {faq.q}
                  <ChevronRight className="group-open:rotate-90 transition-transform flex-shrink-0 ml-8" size={24} strokeWidth={3} />
                </summary>
                <p className="mt-6 text-gray-700 leading-relaxed font-medium pr-12">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 bg-black text-white border-t-8 border-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6 uppercase tracking-tight">READY TO GET STARTED?</h2>
          <p className="text-yellow-400 mb-12 font-black uppercase tracking-widest text-lg">
            {isCustomer 
              ? "JOIN THOUSANDS /// DISCOVER LOCAL TALENT"
              : "GROW YOUR BUSINESS /// POWERFUL PLATFORM"}
          </p>
          <a 
            href={getDashboardLink()}
            className="inline-flex items-center gap-4 bg-yellow-400 text-black px-10 py-5 text-sm font-black uppercase tracking-wider hover:bg-white transition-colors border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
          >
            {isCustomer ? "EXPLORE MARKETPLACE" : "GO TO DASHBOARD"}
            <ChevronRight size={20} strokeWidth={3} />
          </a>
        </div>
      </section>
    </div>
  );
}