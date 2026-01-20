// app/components/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    trackInventory: boolean;
    stock: number | null;
    images: Array<{ url: string; order: number }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', product.id);
    alert(`Added ${product.name} to cart!`);
  };

  const isInStock = !product.trackInventory || (product.stock !== null && product.stock > 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
      {product.images[0] && (
        <div className="relative w-full h-48">
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-lg font-bold text-blue-600">${product.price}</p>
            {product.compareAtPrice && (
              <p className="text-sm text-gray-500 line-through">${product.compareAtPrice}</p>
            )}
          </div>
          {product.trackInventory && product.stock !== null && (
            <span className={`text-xs px-2 py-1 rounded ${
              product.stock > 10 ? 'bg-green-100 text-green-800' : 
              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          )}
        </div>
        
        {/* Product Action Buttons */}
        <div className="flex gap-2">
          {isInStock ? (
            <>
              <Link
                href={`/products/${product.id}`}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center text-sm font-medium"
              >
                View Details
              </Link>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                Add to Cart
              </button>
            </>
          ) : (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed text-sm font-medium"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}