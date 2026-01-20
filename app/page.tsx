"use client"
import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Star, MapPin, Award, Filter, Package, Calendar } from 'lucide-react';

export default function MainyardLanding() {
  const [residents, setResidents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [businessType, setBusinessType] = useState('all'); // all, SERVICES, PRODUCTS, BOTH
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Mock session - replace with actual authentication
  const userRole = "CUSTOMER"; // Change to RESIDENT or ADMIN to test
  const isResident = userRole === "RESIDENT";
  const isAdmin = userRole === "ADMIN";
  const isCustomer = !userRole || userRole === "CUSTOMER";

  // Fetch residents and categories
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
        title: "Your Marketplace Dashboard",
        description: "Manage your services, products, bookings, and orders all in one place.",
        cta: "Go to Dashboard"
      };
    }
    if (isAdmin) {
      return {
        title: "Platform Administration",
        description: "Oversee professionals, products, bookings, and ensure quality across the marketplace.",
        cta: "Go to Admin Panel"
      };
    }
    return {
      title: "Discover Local Talent",
      description: "Book services and shop products from curated professionals in your community.",
      cta: "Explore Marketplace"
    };
  };
  
  const heroContent = getHeroContent();

  const getBusinessTypeLabel = (type) => {
    switch(type) {
      case 'SERVICES': return 'Services';
      case 'PRODUCTS': return 'Products';
      case 'BOTH': return 'Services & Products';
      default: return '';
    }
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Wellness Coach",
      text: "Mainyard transformed how I run my business. I now offer both coaching sessions and wellness products in one place.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Fitness Professional",
      text: "The platform makes it easy to manage bookings and sell my nutrition products. Everything I need in one dashboard.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Beauty Specialist",
      text: "My clients love being able to book appointments and purchase skincare products seamlessly.",
      rating: 5
    }
  ];

  const getFAQs = () => {
    if (isResident) {
      return [
        {
          q: "Can I offer both services and products?",
          a: "Yes! You can choose to offer services only, products only, or both. Set your business type in your profile settings."
        },
        {
          q: "How do payments work?",
          a: "All payments are processed securely through Stripe. You receive earnings within 2-3 business days after a booking is completed or product is delivered."
        },
        {
          q: "Can I create custom categories?",
          a: "Absolutely! You can create custom categories for both your services and products to help organize your offerings."
        },
        {
          q: "How do I manage inventory?",
          a: "For products, you can enable inventory tracking, set stock levels, and receive low-stock alerts in your dashboard."
        }
      ];
    }
    return [
      {
        q: "What can I find on Mainyard?",
        a: "You can book professional services like coaching, wellness sessions, consultations, and shop physical or digital products from local professionals."
      },
      {
        q: "How do I book a service?",
        a: "Browse professionals, select their service, check availability, and book directly. Payment is secure and processed automatically."
      },
      {
        q: "Can I purchase products too?",
        a: "Yes! Many professionals offer products alongside their services. Simply add items to your cart and checkout securely."
      },
      {
        q: "Are all professionals vetted?",
        a: "Every professional undergoes verification including credential checks and quality reviews before joining the platform."
      }
    ];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className={`pt-20 ${isCustomer ? "pb-8" : "pb-20"} px-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {heroContent.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {heroContent.description}
            </p>
            {!isCustomer && (
              <a 
                href={getDashboardLink()}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-gray-800 transition group"
              >
                {heroContent.cta}
                <ChevronRight className="group-hover:translate-x-1 transition" size={20} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Marketplace Browse Section - Only for Customers */}
      {isCustomer && (
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Search and Filter */}
            <div className="mb-12 space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search professionals, services, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-gray-900 transition"
                />
              </div>

              {/* Business Type Filter */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter size={20} />
                  <span className="font-medium">Type:</span>
                </div>
                <button
                  onClick={() => setBusinessType('all')}
                  className={`px-6 py-2 rounded-full transition ${
                    businessType === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setBusinessType('SERVICES')}
                  className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                    businessType === 'SERVICES'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar size={16} />
                  Services
                </button>
                <button
                  onClick={() => setBusinessType('PRODUCTS')}
                  className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                    businessType === 'PRODUCTS'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Package size={16} />
                  Products
                </button>
              </div>

              {/* Category Filter */}
{categories.length > 0 && (
  <div className="flex items-center gap-3 flex-wrap">
    <span className="text-gray-600 font-medium">Category:</span>
    <button
      onClick={() => setSelectedCategory('all')}
      className={`px-6 py-2 rounded-full transition ${
        selectedCategory === 'all'
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      All
    </button>
    {categories.map((category) => (
      <button
        key={category.id}  // CHANGED: was just 'category'
        onClick={() => setSelectedCategory(category.id)}  // CHANGED: was 'category'
        className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
          selectedCategory === category.id  // CHANGED: was 'category'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <span>{category.type === 'SERVICE' ? '🛎️' : '🛍️'}</span>
        {category.name}  {/* CHANGED: was just 'category' */}
      </button>
    ))}
  </div>
)}
            </div>

            {/* Professionals Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl h-96 animate-pulse" />
                ))}
              </div>
            ) : residents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {residents.map((resident) => (
                  <a
                    key={resident.id}
                    href={`/resident/${resident.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-900 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img
                        src={resident.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop'}
                        alt={resident.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {resident.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Star size={14} fill="currentColor" />
                          Featured
                        </div>
                      )}
                      {resident.businessType && (
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                          {getBusinessTypeLabel(resident.businessType)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-medium text-gray-900 mb-1 group-hover:text-gray-700 transition">
                        {resident.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">{resident.title}</p>
                      
                      {resident.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {resident.bio}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="space-y-2 mb-4">
                        {resident.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} />
                            <span>{resident.location}</span>
                          </div>
                        )}
                        {resident.yearsOfExperience && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Award size={14} />
                            <span>{resident.yearsOfExperience} years</span>
                          </div>
                        )}
                        {resident.rating && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star size={14} fill="currentColor" className="text-yellow-400" />
                            <span>{resident.rating} ({resident.reviewCount} reviews)</span>
                          </div>
                        )}
                      </div>

                      {/* Categories */}
{resident.categories && resident.categories.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-4">
    {resident.categories.slice(0, 3).map((cat) => (  // CHANGED: cat is now an object
      <span
        key={cat.id}  // CHANGED: was idx
        className="px-3 py-1 bg-gray-50 text-gray-700 text-xs rounded-full flex items-center gap-1"
      >
        <span>{cat.type === 'SERVICE' ? '🛎️' : '🛍️'}</span>
        {cat.name}  {/* CHANGED: was just cat */}
      </span>
    ))}
    {resident.categories.length > 3 && (
      <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs rounded-full">
        +{resident.categories.length - 3}
      </span>
    )}
  </div>
)}

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-gray-900 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                          View Profile
                          <ChevronRight size={18} />
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600 mb-2">No professionals found</p>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works - Only for customers */}
      {isCustomer && (
        <section className="py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-3 text-center tracking-tight">How It Works</h2>
            <p className="text-center text-xl text-gray-500 mb-24">Simple, secure, and seamless</p>

            <div className="grid md:grid-cols-3 gap-16 md:gap-20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-900 text-white mb-8 mx-auto font-semibold text-lg">
                  1
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Browse & Discover</h3>
                <p className="text-gray-500 leading-relaxed text-lg">
                  Explore curated professionals offering services and products tailored to your needs.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-900 text-white mb-8 mx-auto font-semibold text-lg">
                  2
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Book or Purchase</h3>
                <p className="text-gray-500 leading-relaxed text-lg">
                  Schedule services at convenient times or add products to cart and checkout securely.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-900 text-white mb-8 mx-auto font-semibold text-lg">
                  3
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Experience & Enjoy</h3>
                <p className="text-gray-500 leading-relaxed text-lg">
                  Meet for your service or receive your product. All payments are processed automatically.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-3 text-center tracking-tight">What People Say</h2>
          <p className="text-center text-xl text-gray-500 mb-24">Real experiences from our community</p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 md:p-10 hover:shadow-lg transition-shadow duration-300 border border-gray-100/50">
                <div className="flex gap-0.5 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" className="text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed text-base md:text-lg font-normal">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-24 text-center tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="space-y-2">
            {getFAQs().map((faq, index) => (
              <details key={index} className="bg-white border-b border-gray-200 py-6 group cursor-pointer">
                <summary className="font-semibold text-gray-900 flex items-center justify-between text-lg list-none">
                  {faq.q}
                  <ChevronRight className="group-open:rotate-90 transition-transform flex-shrink-0 ml-4 text-gray-400" size={20} />
                </summary>
                <p className="mt-6 text-gray-500 leading-relaxed text-lg pr-8">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 max-w-[1200px] rounded-[6px] mx-auto bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-light mb-6">Ready to get started?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            {isCustomer 
              ? "Join thousands discovering local talent and quality products"
              : "Grow your business with our powerful platform"}
          </p>
          <a 
            href={getDashboardLink()}
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full hover:bg-gray-100 transition group"
          >
            {isCustomer ? "Explore Marketplace" : "Go to Dashboard"}
            <ChevronRight className="group-hover:translate-x-1 transition" size={20} />
          </a>
        </div>
      </section>
    </div>
  );
}