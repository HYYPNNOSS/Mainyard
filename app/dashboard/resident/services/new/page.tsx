// app/dashboard/resident/services/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
    enabled: true
  });

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
      const response = await fetch('/api/resident/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          categoryId: selectedCategoryId || null,
          enabled: formData.enabled
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create service');
      }

      router.push('/dashboard/resident');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/resident/categories');
        const data = await response.json();
        
        const serviceCategories = data.categories?.filter(
          (cat: any) => cat.type === 'SERVICE'
        ) || [];
        
        setCategories(serviceCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
    
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white border-b-8 border-black">
        <div className="max-w-4xl mx-auto px-6 py-8">
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
              <h1 className="text-5xl font-black uppercase tracking-tight">CREATE NEW SERVICE</h1>
              <p className="text-yellow-400 font-bold uppercase tracking-wider mt-2">ADD A NEW OFFERING TO YOUR PROFILE</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
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
            {/* Service Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest mb-3">
                SERVICE NAME *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="E.G., 60-MIN DEEP TISSUE MASSAGE"
                className="w-full px-6 py-4 border-4 border-black font-bold text-lg uppercase placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="border-t-4 border-black pt-8">
              <label htmlFor="description" className="block text-xs font-black uppercase tracking-widest mb-3">
                DESCRIPTION
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="DESCRIBE WHAT THIS SERVICE INCLUDES..."
                className="w-full px-6 py-4 border-4 border-black font-medium placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
              />
            </div>

            {/* Duration and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t-4 border-black pt-8">
              <div>
                <label htmlFor="duration" className="block text-xs font-black uppercase tracking-widest mb-3">
                  DURATION (MINUTES) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="60"
                  className="w-full px-6 py-4 border-4 border-black font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

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
                  placeholder="75.00"
                  className="w-full px-6 py-4 border-4 border-black font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>
            </div>

            {/* Category */}
            <div className="border-t-4 border-black pt-8">
              <label htmlFor="categoryId" className="block text-xs font-black uppercase tracking-widest mb-3">
                CATEGORY
              </label>
              <div className="flex gap-4">
                <select
                  id="categoryId"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
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
                  href="/dashboard/resident/categories/new"
                  className="px-6 py-4 bg-black text-white border-4 border-black hover:bg-yellow-400 hover:text-black transition-colors font-black uppercase tracking-wider whitespace-nowrap"
                >
                  + NEW CATEGORY
                </Link>
              </div>
            </div>

            {/* Enabled Checkbox */}
            <div className="border-t-4 border-black pt-8">
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
                  SERVICE IS ACTIVE AND AVAILABLE FOR BOOKING
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
                    CREATING...
                  </span>
                ) : (
                  'CREATE SERVICE'
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
      </div>
    </div>
  );
}