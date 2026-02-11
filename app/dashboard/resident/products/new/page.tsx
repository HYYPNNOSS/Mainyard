// app/dashboard/resident/products/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    sku: '',
    trackInventory: false,
    stock: '',
    weight: '',
    isDigital: false,
    enabled: true
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/resident/categories');
        const data = await response.json();
        
        const productCategories = data.categories?.filter(
          (cat: any) => cat.type === 'PRODUCT'
        ) || [];
        
        setCategories(productCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
    
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/resident/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          categoryId: formData.categoryId || null,
          sku: formData.sku || null,
          trackInventory: formData.trackInventory,
          stock: formData.trackInventory ? parseInt(formData.stock) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          isDigital: formData.isDigital,
          enabled: formData.enabled
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/dashboard/resident');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white border-b-8 border-black">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6 mb-4">
            <Link 
              href="/dashboard/resident"
              className="bg-white text-black p-3 hover:bg-yellow-400 transition-colors border-4 border-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tight">CREATE NEW PRODUCT</h1>
              <p className="text-yellow-400 font-bold uppercase tracking-wider mt-2">ADD A NEW PRODUCT TO YOUR STORE</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-yellow-400 border-8 border-black p-6">
            <div className="flex items-center gap-4">
              <svg className="h-8 w-8 text-black flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-black font-black uppercase tracking-wide">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border-8 border-black">
          <div className="p-8 space-y-8">
            {/* BASIC INFORMATION SECTION */}
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-black pb-4 mb-8">
                01 /// BASIC INFORMATION
              </h2>
              
              <div className="space-y-8">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest mb-3">
                    PRODUCT NAME *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="E.G., LAVENDER ESSENTIAL OIL"
                    className="w-full px-6 py-4 border-4 border-black font-bold text-lg uppercase placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-xs font-black uppercase tracking-widest mb-3">
                    DESCRIPTION
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="DESCRIBE YOUR PRODUCT IN DETAIL..."
                    className="w-full px-6 py-4 border-4 border-black font-medium placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="categoryId" className="block text-xs font-black uppercase tracking-widest mb-3">
                    CATEGORY
                  </label>
                  <div className="flex gap-4">
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="flex-1 px-6 py-4 border-4 border-black font-bold uppercase bg-white focus:outline-none focus:border-yellow-400 transition-colors appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' stroke-width='4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.5rem'
                      }}
                    >
                      <option value="">SELECT A CATEGORY (OPTIONAL)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <Link
                      href="/dashboard/resident/categories/new?type=PRODUCT&returnTo=/dashboard/resident/products/new"
                      className="px-6 py-4 bg-black text-white border-4 border-black hover:bg-yellow-400 hover:text-black transition-colors font-black uppercase tracking-wider whitespace-nowrap"
                    >
                      + NEW CATEGORY
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* PRICING SECTION */}
            <div className="border-t-8 border-black pt-8">
              <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-black pb-4 mb-8">
                02 /// PRICING
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-xs font-black uppercase tracking-widest mb-3">
                    PRICE ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="29.99"
                    className="w-full px-6 py-4 border-4 border-black font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="compareAtPrice" className="block text-xs font-black uppercase tracking-widest mb-3">
                    COMPARE AT PRICE ($)
                  </label>
                  <input
                    type="number"
                    id="compareAtPrice"
                    name="compareAtPrice"
                    min="0.01"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    placeholder="39.99"
                    className="w-full px-6 py-4 border-4 border-black font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                  <p className="text-xs font-bold uppercase tracking-wide mt-2">ORIGINAL PRICE TO SHOW DISCOUNT</p>
                </div>
              </div>
            </div>

            {/* INVENTORY SECTION */}
            <div className="border-t-8 border-black pt-8">
              <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-black pb-4 mb-8">
                03 /// INVENTORY
              </h2>
              
              <div className="space-y-6">
                {/* SKU */}
                <div>
                  <label htmlFor="sku" className="block text-xs font-black uppercase tracking-widest mb-3">
                    SKU (STOCK KEEPING UNIT)
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="LAV-OIL-100"
                    className="w-full px-6 py-4 border-4 border-black font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>

                {/* Track Inventory Checkbox */}
                <div>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="trackInventory"
                        name="trackInventory"
                        checked={formData.trackInventory}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-8 border-4 border-black bg-white peer-checked:bg-black flex items-center justify-center transition-colors">
                        {formData.trackInventory && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
                      TRACK INVENTORY QUANTITY
                    </span>
                  </label>
                </div>

                {/* Stock Quantity */}
                {formData.trackInventory && (
                  <div className="bg-yellow-400 border-4 border-black p-6">
                    <label htmlFor="stock" className="block text-xs font-black uppercase tracking-widest mb-3">
                      STOCK QUANTITY *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      required={formData.trackInventory}
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="100"
                      className="w-full px-6 py-4 border-4 border-black font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-white"
                    />
                    <p className="text-xs font-bold uppercase tracking-wide mt-2">CURRENT AVAILABLE QUANTITY</p>
                  </div>
                )}
              </div>
            </div>

            {/* SHIPPING SECTION */}
            <div className="border-t-8 border-black pt-8">
              <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-black pb-4 mb-8">
                04 /// SHIPPING & TYPE
              </h2>
              
              <div className="space-y-6">
                {/* Digital Product Checkbox */}
                <div>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="isDigital"
                        name="isDigital"
                        checked={formData.isDigital}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-8 border-4 border-black bg-white peer-checked:bg-black flex items-center justify-center transition-colors">
                        {formData.isDigital && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
                      THIS IS A DIGITAL PRODUCT (NO SHIPPING REQUIRED)
                    </span>
                  </label>
                </div>

                {/* Weight */}
                {!formData.isDigital && (
                  <div className="bg-white border-4 border-black p-6">
                    <label htmlFor="weight" className="block text-xs font-black uppercase tracking-widest mb-3">
                      WEIGHT (KG)
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      min="0.01"
                      step="0.01"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="0.5"
                      className="w-full px-6 py-4 border-4 border-black font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                    <p className="text-xs font-bold uppercase tracking-wide mt-2">USED FOR SHIPPING CALCULATIONS</p>
                  </div>
                )}
              </div>
            </div>

            {/* VISIBILITY SECTION */}
            <div className="border-t-8 border-black pt-8">
              <h2 className="text-3xl font-black uppercase tracking-tight border-b-4 border-black pb-4 mb-8">
                05 /// VISIBILITY
              </h2>
              
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="enabled"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-8 border-4 border-black bg-white peer-checked:bg-black flex items-center justify-center transition-colors">
                    {formData.enabled && (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-black uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
                  PRODUCT IS ACTIVE AND VISIBLE TO CUSTOMERS
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t-8 border-black bg-white p-8">
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-6 px-8 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    CREATING PRODUCT...
                  </span>
                ) : (
                  'CREATE PRODUCT'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-6 border-4 border-black font-black uppercase tracking-wider text-black hover:bg-black hover:text-white focus:outline-none transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-yellow-400 border-8 border-black p-8">
          <div className="flex items-start gap-6">
            <div className="bg-black p-4 flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 border-b-4 border-black pb-2 inline-block">
                TIPS FOR CREATING PRODUCTS
              </h3>
              <ul className="space-y-2 font-bold uppercase text-sm tracking-wide">
                <li className="flex items-start gap-2">
                  <span className="text-black font-black">→</span>
                  <span>WRITE CLEAR, DETAILED DESCRIPTIONS TO HELP CUSTOMERS UNDERSTAND YOUR PRODUCT</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-black">→</span>
                  <span>USE HIGH-QUALITY IMAGES (YOU CAN ADD THEM AFTER CREATING THE PRODUCT)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-black">→</span>
                  <span>SET COMPETITIVE PRICES BY RESEARCHING SIMILAR PRODUCTS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-black">→</span>
                  <span>ENABLE INVENTORY TRACKING TO AVOID OVERSELLING</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-black">→</span>
                  <span>CREATE CATEGORIES TO HELP ORGANIZE YOUR PRODUCT CATALOG</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}