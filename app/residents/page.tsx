import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Award, ChevronRight } from "lucide-react";

export default async function ResidentsPage() {
  const residents = await prisma.residentProfile.findMany({
    where: {
      approved: true,
      bookingEnabled: true,
    },
    include: {
      user: true,
      images: true,
      categories: {
        where: { enabled: true },
        take: 3,
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-5xl font-light text-gray-900 mb-3">
            Discover Professionals
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse our curated marketplace of talented professionals. 
            From services to products, find exactly what you need.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {residents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No professionals available
            </h3>
            <p className="text-gray-600">
              Check back soon for new listings!
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-8">
              <p className="text-sm text-gray-600">
                {residents.length} {residents.length === 1 ? 'professional' : 'professionals'} available
              </p>
            </div>

            {/* Residents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {residents.map((resident) => {
                const ratings = resident.reviews.map((r) => r.rating);
                const avgRating =
                  ratings.length > 0
                    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                    : null;

                return (
                  <Link
                    key={resident.id}
                    href={`/resident/${resident.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      {resident.images?.[0]?.url ? (
                        <Image
                          src={resident.images[0].url}
                          alt={resident.user.name || "Professional"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Business Type Badge */}
                      <div className="absolute top-3 left-3">
                        {resident.businessType === "SERVICES" && (
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            🛎️ Services
                          </div>
                        )}
                        {resident.businessType === "PRODUCTS" && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            🛍️ Products
                          </div>
                        )}
                        {resident.businessType === "BOTH" && (
                          <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            ✨ Both
                          </div>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {resident.featured && (
                        <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Name and Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition">
                        {resident.user.name || "Unknown"}
                      </h3>
                      
                      {resident.title && (
                        <p className="text-sm text-gray-600 font-medium mb-3">
                          {resident.title}
                        </p>
                      )}

                      {/* Bio */}
                      {resident.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {resident.bio}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="space-y-2 mb-4">
                        {resident.location && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={14} className="flex-shrink-0" />
                            <span>{resident.location}</span>
                          </div>
                        )}
                        {resident.yearsOfExperience && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Award size={14} className="flex-shrink-0" />
                            <span>{resident.yearsOfExperience} years experience</span>
                          </div>
                        )}
                        {avgRating && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Star
                              size={14}
                              fill="currentColor"
                              className="text-yellow-400 flex-shrink-0"
                            />
                            <span>
                              {avgRating.toFixed(1)} ({ratings.length}{" "}
                              {ratings.length === 1 ? "review" : "reviews"})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Categories */}
                      {resident.categories && resident.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resident.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        
                        <span className="text-sm text-gray-600 flex items-center gap-1 group-hover:gap-2 transition-all ml-auto">
                          View Profile
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}