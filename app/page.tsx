"use client"
import React, { useState } from 'react';
import { Search, Calendar, CreditCard, Star, ChevronRight, Menu, X } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";

import Link from 'next/link';

export default function MainyardLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Determine user 
  const { data: session } = useSession();
  
  const userRole = session?.user?.role || null;
  const isResident = userRole === "RESIDENT";
  const isAdmin = userRole === "ADMIN";
  const isClient = !userRole || userRole === "CLIENT";

  console.log(userRole);
  
  // Dynamic content based on role
  const getDashboardLink = () => {
    if (isResident) return "/dashboard/resident";
    if (isAdmin) return "/admin";
    return "/explore"; // Default for clients/non-logged in users
  };
  
  const getHeroContent = () => {
    if (isResident) {
      return {
        title: "Manage Your Professional Services",
        description: "Set your availability, manage bookings, and grow your client base. Your dashboard makes it easy to run your business.",
        cta: "Go to Dashboard"
      };
    }
    if (isAdmin) {
      return {
        title: "Manage Your Platform",
        description: "Oversee professionals, monitor bookings, and ensure quality across the Mainyard community.",
        cta: "Go to Admin Panel"
      };
    }
    return {
      title: "Connect with Curated Professionals",
      description: "Book time with talented residents in your community. From creative consultants to wellness experts, find the perfect professional for your needs.",
      cta: "Explore Professionals"
    };
  };
  
  const heroContent = getHeroContent();

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Consultant",
      text: "Mainyard has transformed how I manage my consulting business. The platform is intuitive and my bookings have tripled.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Fitness Trainer",
      text: "I love how easy it is to set my availability and get paid. No more back-and-forth emails with clients.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Business Coach",
      text: "The curated community aspect means I'm connecting with high-quality clients who value my expertise.",
      rating: 5
    }
  ];

  const professionals = [
    {
      name: "Creative Consultants",
      description: "Connect with designers, writers, and creative strategists for your next project.",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop"
    },
    {
      name: "Wellness Experts",
      description: "Book sessions with certified trainers, yoga instructors, and wellness coaches.",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop"
    },
    {
      name: "Business Advisors",
      description: "Get expert guidance from seasoned professionals in finance, strategy, and operations.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop"
    }
  ];

  // Dynamic FAQ based on role
  const getFAQs = () => {
    if (isResident) {
      return [
        {
          q: "How do I set my availability?",
          a: "In your dashboard, navigate to the calendar section where you can set your available times and block off unavailable periods."
        },
        {
          q: "When do I receive payments?",
          a: "Payments are processed automatically and transferred to your account within 2-3 business days after a session is completed."
        },
        {
          q: "Can I set different rates for different services?",
          a: "Yes! You can create multiple service offerings, each with its own pricing and duration."
        },
        {
          q: "What happens if a client cancels?",
          a: "Our cancellation policy protects you. Clients must cancel at least 24 hours in advance, otherwise you receive compensation."
        }
      ];
    }
    if (isAdmin) {
      return [
        {
          q: "How do I approve new professionals?",
          a: "Navigate to the pending applications section where you can review profiles, credentials, and approve or reject applications."
        },
        {
          q: "Can I monitor platform analytics?",
          a: "Yes, the admin dashboard provides comprehensive analytics on bookings, revenue, user growth, and engagement metrics."
        },
        {
          q: "How do I handle disputes?",
          a: "The dispute resolution system allows you to review cases, communicate with both parties, and make final decisions."
        },
        {
          q: "Can I customize platform settings?",
          a: "Absolutely! You have full control over platform policies, fees, featured categories, and promotional content."
        }
      ];
    }
    return [
      {
        q: "How do I book a professional?",
        a: "Browse our curated professionals, select one that fits your needs, check their availability, and book directly through the platform."
      },
      {
        q: "Is payment secure?",
        a: "Yes, all payments are processed through our secure payment system. Your financial information is encrypted and protected."
      },
      {
        q: "Can I reschedule or cancel a booking?",
        a: "You can reschedule or cancel up to 24 hours before your session. Check our cancellation policy for details."
      },
      {
        q: "How are professionals vetted?",
        a: "Every professional undergoes a thorough vetting process including credential verification, background checks, and quality reviews."
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-light text-gray-900 mb-6 leading-tight">
              {heroContent.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              {heroContent.description}
            </p>
            <Link 
              href={getDashboardLink()}
              className="bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-gray-800 transition flex items-center gap-2 group inline-flex"
            >
              {heroContent.cta}
              <ChevronRight className="group-hover:translate-x-1 transition" size={20} />
            </Link>
          </div>

          {/* Hero Image */}
          <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=900&fit=crop" 
              alt="Professional workspace"
              className="w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* How We Work Section - Only show for clients */}
      {isClient && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-light text-gray-900 mb-4 text-center">How We Work</h2>
            <p className="text-center text-gray-600 mb-16">From Vision to Reality — Here's How It Happens</p>

            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-lg">1</span>
                </div>
                <h3 className="text-2xl font-medium mb-4">Browse Professionals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse our curated collection of incredible residents. Each professional is vetted for quality. From consultants to coaches, you'll find exactly who you need.
                </p>
              </div>

              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-lg">2</span>
                </div>
                <h3 className="text-2xl font-medium mb-4">Select & Schedule</h3>
                <p className="text-gray-600 leading-relaxed">
                  We'll guide you throughout the entire process, making sure you get the perfect match. Check availability in real-time, book with confidence and flexibility. Your satisfaction is our priority.
                </p>
              </div>

              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="font-bold text-lg">3</span>
                </div>
                <h3 className="text-2xl font-medium mb-4">Meet & Pay Securely</h3>
                <p className="text-gray-600 leading-relaxed">
                  Once scheduled, your session is all set up. Meet in person, virtually or at a venue of your choice. All payments are processed securely and automatically.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Resident Benefits Section */}
      {isResident && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-light text-gray-900 mb-4 text-center">Grow Your Business</h2>
            <p className="text-center text-gray-600 mb-16">Everything you need to manage and expand your professional services</p>

            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <Calendar className="text-gray-900" size={24} />
                </div>
                <h3 className="text-2xl font-medium mb-4">Easy Scheduling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Set your availability once and let clients book automatically. No more back-and-forth emails or double bookings.
                </p>
              </div>

              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <CreditCard className="text-gray-900" size={24} />
                </div>
                <h3 className="text-2xl font-medium mb-4">Automatic Payments</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get paid directly to your account. All transactions are secure, automatic, and hassle-free.
                </p>
              </div>

              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <Star className="text-gray-900" size={24} />
                </div>
                <h3 className="text-2xl font-medium mb-4">Quality Clients</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect with clients who value your expertise. Our curated platform attracts serious, committed customers.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Admin Overview Section */}
      {isAdmin && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-light text-gray-900 mb-4 text-center">Platform Management</h2>
            <p className="text-center text-gray-600 mb-16">Comprehensive tools to oversee and optimize your marketplace</p>

            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <Search className="text-gray-900" size={24} />
                </div>
                <h3 className="text-2xl font-medium mb-4">Professional Vetting</h3>
                <p className="text-gray-600 leading-relaxed">
                  Review and approve new professionals. Ensure quality standards are maintained across the platform.
                </p>
              </div>

              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <Calendar className="text-gray-900" size={24} />
                </div>
                <h3 className="text-2xl font-medium mb-4">Analytics & Insights</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor bookings, revenue, and user engagement. Make data-driven decisions to grow the platform.
                </p>
              </div>

              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <Star className="text-gray-900" size={24} />
                </div>
                <h3 className="text-2xl font-medium mb-4">Quality Control</h3>
                <p className="text-gray-600 leading-relaxed">
                  Handle disputes, manage reviews, and maintain the high standards that make Mainyard exceptional.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-light text-gray-900 mb-4">Why Choose Mainyard?</h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl">
            {isResident 
              ? "Join a platform designed to help you succeed. Build your business with tools that work for you."
              : isAdmin
              ? "A robust platform with all the tools you need to manage a thriving professional marketplace."
              : "A platform crafted to bridge connections, simplify booking, and provide curated professionals that exceed your expectations."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <div className="text-5xl font-light text-gray-900 mb-2">5K+</div>
              <div className="text-gray-600">Successful Bookings</div>
            </div>
            <div>
              <div className="text-5xl font-light text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Verified Professionals</div>
            </div>
            <div>
              <div className="text-5xl font-light text-gray-900 mb-2">99%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-5xl font-light text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Platform Availability</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <p className="text-xl text-gray-700 leading-relaxed">
              {isResident
                ? "As a Mainyard professional, you're part of an exclusive community. We handle the technology and payments so you can focus on what you do best. Our secure payment system, easy scheduling tools, and quality client base mean you can grow your business with confidence."
                : isAdmin
                ? "The Mainyard admin platform gives you complete control over your marketplace. From professional vetting to analytics and dispute resolution, you have all the tools needed to maintain quality, drive growth, and ensure a exceptional experience for everyone."
                : "Every professional on our platform is carefully vetted and selected for their expertise and professionalism. We believe in quality over quantity, ensuring you connect with the best talent in your community. Our secure payment system and easy booking process means you can focus on what matters most—getting the help you need."}
            </p>
          </div>
        </div>
      </section>

      {/* Professional Categories - Only show for clients */}
      {isClient && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-light text-gray-900 mb-4">Professional Categories</h2>
            <p className="text-gray-600 mb-16 max-w-2xl">
              From consultants to trainers, explore our diverse pool of talent. Every professional brings unique expertise, carefully curated for exceptional quality.
            </p>

            <div className="space-y-16">
              {professionals.map((prof, index) => (
                <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
                  <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                    <div className="text-gray-400 mb-2">{index + 1}.</div>
                    <h3 className="text-4xl font-light text-gray-900 mb-4">{prof.name}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{prof.description}</p>
                    <Link href="/explore" className="text-gray-900 font-medium flex items-center gap-2 group">
                      Explore Category
                      <ChevronRight className="group-hover:translate-x-1 transition" size={20} />
                    </Link>
                  </div>
                  <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                      <img 
                        src={prof.image}
                        alt={prof.name}
                        className="w-full h-[400px] object-cover hover:scale-105 transition duration-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-light text-gray-900 mb-4 text-center">Testimonials</h2>
          <p className="text-center text-gray-600 mb-16">
            Real feedback from our community — and we're here to build on years of excellence.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-medium text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-6">
            {isResident || isAdmin ? "Need Help?" : "Get In Touch"}
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            {isResident || isAdmin 
              ? "Our support team is here to help you make the most of the platform."
              : "Our team is here to guide you through every step, from initial ideas to final consultation."}
          </p>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input 
                type="text" 
                placeholder="Your name"
                className="w-full px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:border-gray-900 transition"
              />
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:border-gray-900 transition"
              />
            </div>
            <textarea 
              placeholder="Tell us about your needs..."
              rows={6}
              className="w-full px-6 py-4 rounded-3xl border border-gray-300 focus:outline-none focus:border-gray-900 transition resize-none"
            />
            <button className="bg-gray-900 text-white px-12 py-4 rounded-full hover:bg-gray-800 transition">
              Send Message
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-light text-gray-900 mb-16 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {getFAQs().map((faq, index) => (
              <details key={index} className="bg-white rounded-2xl p-6 shadow-sm group">
                <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="group-open:rotate-90 transition" size={20} />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}