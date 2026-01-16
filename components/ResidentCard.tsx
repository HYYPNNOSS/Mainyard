import Link from "next/link";
import Image from "next/image";

interface ResidentCardProps {
  id: string;
  slug: string;
  name: string;
  bio: string;
  price: number;
  image: string;
  featured: boolean;
}

export default function ResidentCard({
  slug,
  name,
  bio,
  price,
  image,
  featured,
}: ResidentCardProps) {
  return (
    <Link href={`/residents/${slug}`} className="group">
      <div
        className={`
          relative h-full rounded-2xl bg-white p-4
          border border-gray-200
          transition-all duration-300
          hover:-translate-y-1 hover:shadow-xl
          focus-visible:ring-2 focus-visible:ring-blue-500
          ${featured ? "ring-2 ring-yellow-400" : ""}
        `}
      >
        {/* Image */}
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-xl bg-gray-200">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-300">
              <span className="text-sm text-gray-500">No image</span>
            </div>
          )}

          {featured && (
            <span className="absolute top-3 right-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-900 shadow">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {name}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2">
            {bio}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-blue-600">
              ${price}
            </span>
            <span className="text-sm text-gray-500">
              / hour
            </span>
          </div>

          <span className="text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
