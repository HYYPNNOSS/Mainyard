// app/dashboard/resident/categories/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NewCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businessType, setBusinessType] = useState<'SERVICES' | 'PRODUCTS' | 'BOTH' | null>(null);
  
  // Get type and returnTo from URL params
  const typeParam = searchParams.get('type') as 'SERVICE' | 'PRODUCT' | null;
  const returnTo = searchParams.get('returnTo');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: typeParam || 'SERVICE',
    enabled: true
  });

  // Load business type on mount
  useEffect(() => {
    async function loadBusinessType() {
      try {
        const response = await fetch('/api/resident/profile');
        const data = await response.json();
        setBusinessType(data.businessType);
        
        // If business type doesn't allow the selected type, adjust it
        if (data.businessType === 'SERVICES' && formData.type === 'PRODUCT') {
          setFormData(prev => ({ ...prev, type: 'SERVICE' }));
        } else if (data.businessType === 'PRODUCTS' && formData.type === 'SERVICE') {
          setFormData(prev => ({ ...prev, type: 'PRODUCT' }));
        }
      } catch (error) {
        console.error('Failed to load business type:', error);
      }
    }
    
    loadBusinessType();
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
      const response = await fetch('/api/resident/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          enabled: formData.enabled
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      // Redirect to returnTo URL if provided, otherwise go to dashboard
      if (returnTo) {
        router.push(returnTo);
      } else {
        router.push('/dashboard/resident');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Determine if type selection should be shown
  const canSelectType = businessType === 'BOTH';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Category</h1>
        <p className="text-gray-600 mt-2">
          Organize your {formData.type === 'SERVICE' ? 'services' : 'products'} with custom categories
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        {/* Category Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Category Type *
          </label>
          {canSelectType ? (
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SERVICE">Service Category</option>
              <option value="PRODUCT">Product Category</option>
            </select>
          ) : (
            <div>
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                {formData.type === 'SERVICE' ? '🛎️ Service Category' : '🛍️ Product Category'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on your business type: {businessType}
              </p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {formData.type === 'SERVICE' 
              ? 'Use this to organize bookable services (e.g., "Massage Therapy", "Spa Treatments")'
              : 'Use this to organize products for sale (e.g., "Essential Oils", "Skincare")'}
          </p>
        </div>

        {/* Category Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder={
              formData.type === 'SERVICE' 
                ? 'e.g., Deep Tissue Massage, Aromatherapy' 
                : 'e.g., Organic Skincare, Massage Tools'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder={
              formData.type === 'SERVICE'
                ? 'Describe what types of services are in this category...'
                : 'Describe what types of products are in this category...'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Help customers understand what's included in this category
          </p>
        </div>

        {/* Enabled Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={formData.enabled}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="text-sm text-gray-700">
            Category is active and visible
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Category...' : 'Create Category'}
          </button>
          <button
            type="button"
            onClick={() => returnTo ? router.push(returnTo) : router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Example Categories */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Example {formData.type === 'SERVICE' ? 'Service' : 'Product'} Categories
        </h3>
        {formData.type === 'SERVICE' ? (
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Massage Therapy:</strong> Deep Tissue, Swedish, Hot Stone</li>
            <li>• <strong>Spa Treatments:</strong> Facials, Body Wraps, Scrubs</li>
            <li>• <strong>Aromatherapy:</strong> Essential Oil Massages, Diffusion Sessions</li>
            <li>• <strong>Wellness:</strong> Meditation, Yoga, Reiki</li>
          </ul>
        ) : (
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Essential Oils:</strong> Lavender, Peppermint, Eucalyptus</li>
            <li>• <strong>Skincare:</strong> Moisturizers, Cleansers, Serums</li>
            <li>• <strong>Massage Tools:</strong> Rollers, Heating Pads, Massage Balls</li>
            <li>• <strong>Wellness Supplements:</strong> Vitamins, Herbs, Teas</li>
          </ul>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">About Categories</p>
            <p>
              Categories help organize your {formData.type === 'SERVICE' ? 'services' : 'products'} and 
              make it easier for customers to find what they're looking for. You can create as many categories 
              as you need and assign multiple {formData.type === 'SERVICE' ? 'services' : 'products'} to each category.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}