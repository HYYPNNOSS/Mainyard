import { prisma } from "@/lib/prisma";
import ResidentCard from "@/components/ResidentCard";

export default async function ResidentsPage() {
  const residents = await prisma.residentProfile.findMany({
    where: {
      approved: true,
      bookingEnabled: true,
    },
    include: {
      user: true,
      images: true, // Added this line to include images
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Browse Residents</h1>
        <p className="text-xl text-gray-600">
          Discover talented professionals ready to book your time.
        </p>
      </div>

      {residents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            No residents available at the moment. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {residents.map((resident) => (
            <ResidentCard
              key={resident.id}
              id={resident.id}
              slug={resident.slug}
              name={resident.user.name || "Unknown"}
              bio={resident.bio || ""}
              price={resident.price}
              image={resident.images?.[0]?.url || ""} // Updated to access the url property
              featured={resident.featured}
            />
          ))}
        </div>
      )}
    </div>
  );
}