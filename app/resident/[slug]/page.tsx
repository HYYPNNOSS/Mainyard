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
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Images */}
          <div className="mb-8">
            {resident.images && resident.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resident.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={`${resident.user.name} - Image ${image.id}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No images available</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="card mb-8">
            {resident.bio && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{resident.bio}</p>
              </div>
            )}

            {resident.description && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Details</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {resident.description}
                </p>
              </div>
            )}
          </div>

          {/* Categories & Offerings */}
          {(resident.categories.length > 0 || resident.services.length > 0 || resident.products.length > 0) && (
            <div className="card mb-8" id="offerings">
              <h2 className="text-2xl font-bold mb-4">
                {resident.businessType === 'SERVICES' ? 'Services' : 
                 resident.businessType === 'PRODUCTS' ? 'Products' : 
                 'Our Offerings'}
              </h2>
              
              {/* Show Categories with their items */}
              {resident.categories.map((category) => {
                const categoryServices = resident.services?.filter(s => s.categoryId === category.id) || [];
                const categoryProducts = resident.products?.filter(p => p.categoryId === category.id) || [];
                
                if (categoryServices.length === 0 && categoryProducts.length === 0) return null;
                
                return (
                  <div key={category.id} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">
                        {category.type === 'SERVICE' ? '🛎️' : '🛍️'}
                      </span>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    )}
                    
                    {/* Services in this category */}
                    {categoryServices.length > 0 && (
                      <div className="space-y-3">
                        {categoryServices.map((service) => (
                          <div key={service.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                {service.description && (
                                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                  Duration: {service.duration} minutes
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-xl font-bold text-blue-600 mb-2">${service.price}</p>
                                {resident.bookingEnabled && (
                                  <Link
                                    href={`/book/${resident.id}?serviceId=${service.id}`}
                                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                  >
                                    Book Now
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Services</h3>
                  <div className="space-y-3">
                    {resident.services.filter(s => !s.categoryId).map((service) => (
                      <div key={service.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                              Duration: {service.duration} minutes
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xl font-bold text-blue-600 mb-2">${service.price}</p>
                            {resident.bookingEnabled && (
                              <Link
                                href={`/book/${resident.id}?serviceId=${service.id}`}
                                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                              >
                                Book Now
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Availability</h2>
              {resident.availabilities.length === 0 ? (
                <p className="text-gray-600">No availability set</p>
              ) : (
                <div className="space-y-4">
                  {resident.availabilities.map((avail) => (
                    <div
                      key={avail.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <span className="font-semibold">
                        {dayNames[avail.dayOfWeek]}
                      </span>
                      <span className="text-gray-600">
                        {avail.startTime} - {avail.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {resident.reviews && resident.reviews.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              
              {/* Average Rating */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">
                      {(resident.reviews.reduce((sum, r) => sum + r.rating, 0) / resident.reviews.length).toFixed(1)}
                    </p>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(resident.reviews.reduce((sum, r) => sum + r.rating, 0) / resident.reviews.length)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {resident.reviews.length} {resident.reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Individual Reviews */}
              <div className="space-y-4">
                {resident.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      {review.customer.image ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={review.customer.image}
                            alt={review.customer.name || 'Customer'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">
                            {review.customer.name?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{review.customer.name || 'Anonymous'}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* Resident Response */}
                        {review.response && (
                          <div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-700 mb-1">
                              Response from {resident.user.name}
                            </p>
                            <p className="text-sm text-gray-600">{review.response}</p>
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
          <div className="card sticky top-24">
            <div className="mb-6">
              {resident.user.image && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={resident.user.image}
                    alt={resident.user.name || "Profile"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{resident.user.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Member since{" "}
                {new Date(resident.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Sidebar buttons based on business type */}
            {resident.businessType === 'SERVICES' && resident.bookingEnabled && (
              <Link
                href={`/book/${resident.id}`}
                className="btn-primary w-full text-center block mb-3"
              >
                Book a Service
              </Link>
            )}

            {resident.businessType === 'PRODUCTS' && (
              <div className="space-y-3">
                <p className="text-center text-gray-600 text-sm font-medium">
                  Browse our products below
                </p>
                <Link
                  href={`/shop/${resident.id}`}
                  className="btn-primary w-full text-center block"
                >
                  Shop Products
                </Link>
              </div>
            )}

            {resident.businessType === 'BOTH' && (
              <div className="space-y-3">
                {resident.bookingEnabled && (
                  <Link
                    href={`/book/${resident.id}`}
                    className="btn-primary w-full text-center block"
                  >
                    Book a Service
                  </Link>
                )}
                <Link
                  href={`/shop/${resident.id}`}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold w-full text-center block"
                >
                  Shop Products
                </Link>
              </div>
            )}

            {!resident.bookingEnabled && resident.businessType === 'SERVICES' && (
              <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
                Bookings Disabled
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}