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
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-yellow-400 border-b-8 border-black">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-7xl md:text-8xl font-black text-black mb-6 uppercase tracking-tight leading-[0.9]">
            DISCOVER PROFESSIONALS
          </h1>
          <p className="text-xl text-black max-w-3xl font-bold uppercase tracking-wide leading-tight">
            BROWSE OUR CURATED MARKETPLACE OF TALENTED PROFESSIONALS /// FROM SERVICES TO PRODUCTS /// FIND EXACTLY WHAT YOU NEED
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {residents.length === 0 ? (
          <div className="text-center py-32 border-8 border-black bg-yellow-400">
            <div className="w-24 h-24 bg-black border-4 border-black flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-12 h-12 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-black mb-4 uppercase tracking-tight">
              NO PROFESSIONALS AVAILABLE
            </h3>
            <p className="text-black font-bold uppercase tracking-wider">
              CHECK BACK SOON FOR NEW LISTINGS!
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-12 border-b-4 border-black pb-6">
              <p className="text-lg font-black uppercase tracking-widest">
                {residents.length} {residents.length === 1 ? 'PROFESSIONAL' : 'PROFESSIONALS'} AVAILABLE
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
                    className="group bg-white border-4 border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden"
                  >
                    {/* Image Container */}
                    <div className="relative h-72 overflow-hidden bg-gray-100 border-b-4 border-black">
                      {resident.images?.[0]?.url ? (
                        <Image
                          src={resident.images[0].url}
                          alt={resident.user.name || "Professional"}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg
                            className="w-16 h-16 text-black"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Business Type Badge */}
                      <div className="absolute top-4 left-4">
                        {resident.businessType === "SERVICES" && (
                          <div className="bg-white text-black px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-widest">
                            SERVICES
                          </div>
                        )}
                        {resident.businessType === "PRODUCTS" && (
                          <div className="bg-white text-black px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-widest">
                            PRODUCTS
                          </div>
                        )}
                        {resident.businessType === "BOTH" && (
                          <div className="bg-white text-black px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-widest">
                            SERVICES & PRODUCTS
                          </div>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {resident.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-black px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <Star size={14} fill="currentColor" strokeWidth={3} />
                          FEATURED
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Name and Title */}
                      <h3 className="text-2xl font-black text-black mb-1 uppercase tracking-tight">
                        {resident.user.name || "UNKNOWN"}
                      </h3>
                      
                      {resident.title && (
                        <p className="text-sm text-black font-bold uppercase mb-4 tracking-wider">
                          {resident.title}
                        </p>
                      )}

                      {/* Bio */}
                      {resident.bio && (
                        <p className="text-sm text-gray-700 mb-5 line-clamp-2 leading-relaxed">
                          {resident.bio}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="space-y-2 mb-5 pb-5 border-b-2 border-black">
                        {resident.location && (
                          <div className="flex items-center gap-2 text-xs text-black font-bold uppercase tracking-wide">
                            <MapPin size={14} className="flex-shrink-0" strokeWidth={3} />
                            <span>{resident.location}</span>
                          </div>
                        )}
                        {resident.yearsOfExperience && (
                          <div className="flex items-center gap-2 text-xs text-black font-bold uppercase tracking-wide">
                            <Award size={14} className="flex-shrink-0" strokeWidth={3} />
                            <span>{resident.yearsOfExperience} YEARS</span>
                          </div>
                        )}
                        {avgRating && (
                          <div className="flex items-center gap-2 text-xs text-black font-bold uppercase tracking-wide">
                            <Star
                              size={14}
                              fill="currentColor"
                              className="flex-shrink-0"
                              strokeWidth={3}
                            />
                            <span>
                              {avgRating.toFixed(1)} · {ratings.length}{" "}
                              {ratings.length === 1 ? "REVIEW" : "REVIEWS"}
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
                              className="px-3 py-1.5 bg-white text-black text-xs font-black uppercase tracking-wider border-2 border-black"
                            >
                              {cat.name.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-sm text-black font-black uppercase tracking-wider flex items-center gap-2 ml-auto">
                          VIEW PROFILE
                          <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
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