import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

interface ResidentProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ResidentProfilePage({
  params,
}: ResidentProfilePageProps) {
  const { slug } = await params;

  const resident = await prisma.residentProfile.findUnique({
    where: { slug },
    include: {
      user: true,
      availabilities: true,
      images: true,
      categories: {
        where: { enabled: true },
        orderBy: { order: 'asc' }
      },
      services: {
        where: { enabled: true },
        include: {
          category: true
        },
        orderBy: { order: 'asc' }
      },
      products: {
        where: { enabled: true },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
            take: 1
          }
        },
        orderBy: { order: 'asc' }
      },
      reviews: {
        include: {
          customer: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    },
  });

  if (!resident || !resident.approved) {
    notFound();
  }

  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Images */}
          <div className="mb-8">
            {resident.images && resident.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resident.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative w-full h-72 bg-gray-100 border-8 border-black overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={`${resident.user.name} - Image ${image.id}`}
                      fill
                      className="object-cover grayscale"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-72 bg-yellow-400 border-8 border-black flex items-center justify-center">
                <span className="text-black font-black uppercase tracking-widest">NO IMAGES AVAILABLE</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="bg-white border-8 border-black p-8 mb-8">
            {resident.bio && (
              <div className="mb-8 pb-8 border-b-4 border-black">
                <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">ABOUT</h2>
                <p className="text-black font-medium leading-relaxed whitespace-pre-wrap">{resident.bio}</p>
              </div>
            )}

            {resident.description && (
              <div>
                <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">DETAILS</h2>
                <p className="text-black font-medium leading-relaxed whitespace-pre-wrap">
                  {resident.description}
                </p>
              </div>
            )}
          </div>

          {/* Categories & Offerings */}
          {(resident.categories.length > 0 || resident.services.length > 0 || resident.products.length > 0) && (
            <div className="bg-white border-8 border-black p-8 mb-8" id="offerings">
              <h2 className="text-4xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-6">
                {resident.businessType === 'SERVICES' ? 'SERVICES' : 
                 resident.businessType === 'PRODUCTS' ? 'PRODUCTS' : 
                 'OUR OFFERINGS'}
              </h2>
              
              {/* Show Categories with their items */}
              {resident.categories.map((category) => {
                const categoryServices = resident.services?.filter(s => s.categoryId === category.id) || [];
                const categoryProducts = resident.products?.filter(p => p.categoryId === category.id) || [];
                
                if (categoryServices.length === 0 && categoryProducts.length === 0) return null;
                
                return (
                  <div key={category.id} className="mb-8 last:mb-0 border-b-4 border-black pb-8 last:border-b-0 last:pb-0">
                    <h3 className="text-2xl font-black text-black mb-4 flex items-center uppercase tracking-tight">
                      <span className="mr-3 text-3xl">
                        {category.type === 'SERVICE' ? '🛎️' : '🛍️'}
                      </span>
                      {category.name.toUpperCase()}
                    </h3>
                    {category.description && (
                      <p className="text-sm font-medium text-black mb-6 uppercase tracking-wide">{category.description}</p>
                    )}
                    
                    {/* Services in this category */}
                    {categoryServices.length > 0 && (
                      <div className="space-y-4">
                        {categoryServices.map((service) => (
                          <div key={service.id} className="p-6 bg-white border-4 border-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-black text-xl uppercase tracking-tight text-black">{service.name}</h4>
                                {service.description && (
                                  <p className="text-sm font-medium text-black mt-2">{service.description}</p>
                                )}
                                <p className="text-sm font-bold uppercase tracking-wide text-black mt-3">
                                  DURATION: {service.duration} MINUTES
                                </p>
                              </div>
                              <div className="text-right ml-6 flex-shrink-0">
                                <p className="text-4xl font-black mb-4">${service.price}</p>
                                {resident.bookingEnabled && (
                                  <Link
                                    href={`/book/${resident.id}?serviceId=${service.id}`}
                                    className="inline-block bg-black text-white px-6 py-3 border-4 border-black hover:bg-white hover:text-black transition-colors text-sm font-black uppercase tracking-wider"
                                  >
                                    BOOK NOW
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Products in this category */}
                    {categoryProducts.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categoryProducts.map((product) => (
                          <ProductCard 
                            key={product.id} 
                            product={{
                              id: product.id,
                              name: product.name,
                              description: product.description,
                              price: product.price,
                              compareAtPrice: product.compareAtPrice,
                              trackInventory: product.trackInventory,
                              stock: product.stock,
                              images: product.images
                            }} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Uncategorized Services */}
              {resident.services?.filter(s => !s.categoryId).length > 0 && (
                <div className="mb-8 border-b-4 border-black pb-8">
                  <h3 className="text-2xl font-black text-black mb-6 uppercase tracking-tight">OTHER SERVICES</h3>
                  <div className="space-y-4">
                    {resident.services.filter(s => !s.categoryId).map((service) => (
                      <div key={service.id} className="p-6 bg-white border-4 border-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-black text-xl uppercase tracking-tight text-black">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm font-medium text-black mt-2">{service.description}</p>
                            )}
                            <p className="text-sm font-bold uppercase tracking-wide text-black mt-3">
                              DURATION: {service.duration} MINUTES
                            </p>
                          </div>
                          <div className="text-right ml-6 flex-shrink-0">
                            <p className="text-4xl font-black mb-4">${service.price}</p>
                            {resident.bookingEnabled && (
                              <Link
                                href={`/book/${resident.id}?serviceId=${service.id}`}
                                className="inline-block bg-black text-white px-6 py-3 border-4 border-black hover:bg-white hover:text-black transition-colors text-sm font-black uppercase tracking-wider"
                              >
                                BOOK NOW
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Uncategorized Products */}
              {resident.products?.filter(p => !p.categoryId).length > 0 && (
                <div>
                  <h3 className="text-2xl font-black text-black mb-6 uppercase tracking-tight">OTHER PRODUCTS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resident.products.filter(p => !p.categoryId).map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={{
                          id: product.id,
                          name: product.name,
                          description: product.description,
                          price: product.price,
                          compareAtPrice: product.compareAtPrice,
                          trackInventory: product.trackInventory,
                          stock: product.stock,
                          images: product.images
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Availability */}
          {resident.businessType !== 'PRODUCTS' && (
            <div className="bg-white border-8 border-black p-8 mb-8">
              <h2 className="text-4xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-6">AVAILABILITY</h2>
              {resident.availabilities.length === 0 ? (
                <div className="bg-yellow-400 border-4 border-black p-8 text-center">
                  <p className="text-black font-black uppercase tracking-wider">NO AVAILABILITY SET</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resident.availabilities.map((avail) => (
                    <div
                      key={avail.id}
                      className="flex justify-between items-center p-6 bg-white border-4 border-black"
                    >
                      <span className="font-black text-lg uppercase tracking-wider">
                        {dayNames[avail.dayOfWeek]}
                      </span>
                      <span className="text-black font-black text-lg uppercase">
                        {avail.startTime} — {avail.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {resident.reviews && resident.reviews.length > 0 && (
            <div className="bg-white border-8 border-black p-8">
              <h2 className="text-4xl font-black mb-8 uppercase tracking-tight border-b-4 border-black pb-6">CUSTOMER REVIEWS</h2>
              
              {/* Average Rating */}
              <div className="mb-8 p-8 bg-yellow-400 border-4 border-black">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-7xl font-black">
                      {(resident.reviews.reduce((sum, r) => sum + r.rating, 0) / resident.reviews.length).toFixed(1)}
                    </p>
                    <div className="flex items-center justify-center mt-3 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-8 h-8 ${
                            i < Math.round(resident.reviews.reduce((sum, r) => sum + r.rating, 0) / resident.reviews.length)
                              ? 'text-black'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest mt-3">
                      {resident.reviews.length} {resident.reviews.length === 1 ? 'REVIEW' : 'REVIEWS'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Individual Reviews */}
              <div className="space-y-6">
                {resident.reviews.map((review) => (
                  <div key={review.id} className="border-b-4 border-black pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      {review.customer.image ? (
                        <div className="relative w-16 h-16 border-4 border-black overflow-hidden flex-shrink-0">
                          <Image
                            src={review.customer.image}
                            alt={review.customer.name || 'Customer'}
                            fill
                            className="object-cover grayscale"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 border-4 border-black bg-black flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-400 font-black text-2xl">
                            {review.customer.name?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-black text-xl uppercase tracking-tight">{review.customer.name || 'ANONYMOUS'}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${i < review.rating ? 'text-black' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-black text-sm font-medium leading-relaxed">{review.comment}</p>
                        )}
                        <p className="text-xs font-bold uppercase tracking-wider text-black mt-3">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* Resident Response */}
                        {review.response && (
                          <div className="mt-4 ml-4 p-4 bg-yellow-400 border-4 border-black">
                            <p className="text-xs font-black uppercase tracking-widest text-black mb-2">
                              RESPONSE FROM {resident.user.name?.toUpperCase()}
                            </p>
                            <p className="text-sm font-medium text-black">{review.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white border-8 border-black p-8 sticky top-24">
            <div className="mb-8 pb-8 border-b-4 border-black">
              {resident.user.image && (
                <div className="relative w-full h-64 mb-6 border-4 border-black overflow-hidden">
                  <Image
                    src={resident.user.image}
                    alt={resident.user.name || "Profile"}
                    fill
                    className="object-cover grayscale"
                  />
                </div>
              )}
              <h3 className="text-3xl font-black mb-3 uppercase tracking-tight">{resident.user.name}</h3>
              <p className="text-sm font-bold uppercase tracking-wider text-black">
                MEMBER SINCE {new Date(resident.createdAt).toLocaleDateString().toUpperCase()}
              </p>
            </div>

            {/* Sidebar buttons based on business type */}
            {resident.businessType === 'SERVICES' && resident.bookingEnabled && (
              <Link
                href={`/book/${resident.id}`}
                className="bg-black text-white px-8 py-5 border-4 border-black hover:bg-yellow-400 hover:text-black transition-colors w-full text-center block font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4"
              >
                BOOK A SERVICE
              </Link>
            )}

            {resident.businessType === 'PRODUCTS' && (
              <div className="space-y-4">
                <p className="text-center text-black text-sm font-black uppercase tracking-wide border-4 border-black p-4 bg-yellow-400">
                  BROWSE OUR PRODUCTS BELOW
                </p>
                <Link
                  href={`/shop/${resident.id}`}
                  className="bg-black text-white px-8 py-5 border-4 border-black hover:bg-yellow-400 hover:text-black transition-colors w-full text-center block font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  SHOP PRODUCTS
                </Link>
              </div>
            )}

            {resident.businessType === 'BOTH' && (
              <div className="space-y-4">
                {resident.bookingEnabled && (
                  <Link
                    href={`/book/${resident.id}`}
                    className="bg-black text-white px-8 py-5 border-4 border-black hover:bg-yellow-400 hover:text-black transition-colors w-full text-center block font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    BOOK A SERVICE
                  </Link>
                )}
                <Link
                  href={`/shop/${resident.id}`}
                  className="bg-white text-black px-8 py-5 border-4 border-black hover:bg-yellow-400 transition-colors w-full text-center block font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  SHOP PRODUCTS
                </Link>
              </div>
            )}

            {!resident.bookingEnabled && resident.businessType === 'SERVICES' && (
              <button disabled className="bg-gray-200 text-gray-500 px-8 py-5 border-4 border-black w-full font-black uppercase tracking-wider cursor-not-allowed">
                BOOKINGS DISABLED
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}