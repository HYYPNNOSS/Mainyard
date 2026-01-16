import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

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
            src={image.url} // or whatever field name you use
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
            <h1 className="text-4xl font-bold mb-2">{resident.user.name}</h1>
            <p className="text-xl text-gray-600 mb-6">${resident.price} per hour</p>

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

          {/* Availability */}
          <div className="card">
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

            {resident.bookingEnabled ? (
              <Link
                href={`/book/${resident.id}`}
                className="btn-primary w-full text-center block"
              >
                Book Now
              </Link>
            ) : (
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
