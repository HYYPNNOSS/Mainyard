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
  
  const typeParam = searchParams.get('type') as 'SERVICE' | 'PRODUCT' | null;
  const returnTo = searchParams.get('returnTo');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: typeParam || 'SERVICE',
    enabled: true
  });

  useEffect(() => {
    async function loadBusinessType() {
      try {
        const response = await fetch('/api/resident/profile');
        const data = await response.json();
        setBusinessType(data.businessType);
        
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

  const canSelectType = businessType === 'BOTH';

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 bg-white">
      <div className="border-8 border-black p-12 bg-black text-white mb-12">
        <h1 className="text-6xl font-black uppercase tracking-tight mb-4">CREATE NEW CATEGORY</h1>
        <p className="text-xl font-bold uppercase tracking-wide">
          ORGANIZE YOUR {formData.type === 'SERVICE' ? 'SERVICES' : 'PRODUCTS'} WITH CUSTOM CATEGORIES
        </p>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-yellow-400 border-8 border-black">
          <p className="font-black uppercase tracking-wide text-black">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border-8 border-black p-8 mb-8">
        {/* Category Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-black uppercase tracking-widest mb-4">
            CATEGORY TYPE *
          </label>
          {canSelectType ? (
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-bold text-black uppercase bg-white"
            >
              <option value="SERVICE">SERVICE CATEGORY</option>
              <option value="PRODUCT">PRODUCT CATEGORY</option>
            </select>
          ) : (
            <div>
              <div className="w-full px-5 py-4 border-4 border-black bg-yellow-400 text-black font-black text-lg uppercase">
                {formData.type === 'SERVICE' ? '🛎️ SERVICE CATEGORY' : '🛍️ PRODUCT CATEGORY'}
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-black mt-3 border-4 border-black bg-white p-3">
                BASED ON YOUR BUSINESS TYPE: {businessType}
              </p>
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-wide text-black mt-3 border-4 border-black bg-yellow-400 p-3">
            {formData.type === 'SERVICE' 
              ? 'USE THIS TO ORGANIZE BOOKABLE SERVICES (E.G., "MASSAGE THERAPY", "SPA TREATMENTS")'
              : 'USE THIS TO ORGANIZE PRODUCTS FOR SALE (E.G., "ESSENTIAL OILS", "SKINCARE")'}
          </p>
        </div>

        {/* Category Name */}
        <div className="border-t-4 border-black pt-8">
          <label htmlFor="name" className="block text-sm font-black uppercase tracking-widest mb-4">
            CATEGORY NAME *
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
                ? 'E.G., DEEP TISSUE MASSAGE, AROMATHERAPY' 
                : 'E.G., ORGANIC SKINCARE, MASSAGE TOOLS'
            }
            className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-bold text-black placeholder:text-gray-400 placeholder:uppercase"
          />
        </div>

        {/* Description */}
        <div className="border-t-4 border-black pt-8">
          <label htmlFor="description" className="block text-sm font-black uppercase tracking-widest mb-4">
            DESCRIPTION (OPTIONAL)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder={
              formData.type === 'SERVICE'
                ? 'DESCRIBE WHAT TYPES OF SERVICES ARE IN THIS CATEGORY...'
                : 'DESCRIBE WHAT TYPES OF PRODUCTS ARE IN THIS CATEGORY...'
            }
            className="w-full px-5 py-4 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow font-medium text-black resize-none placeholder:text-gray-400 placeholder:uppercase"
          />
          <p className="text-xs font-bold uppercase tracking-wide text-black mt-3 border-4 border-black bg-yellow-400 p-3">
            HELP CUSTOMERS UNDERSTAND WHAT'S INCLUDED IN THIS CATEGORY
          </p>
        </div>

        {/* Enabled Checkbox */}
        <div className="border-t-4 border-black pt-8">
          <label className="flex items-center gap-4 cursor-pointer p-4 border-4 border-black hover:bg-yellow-400 transition-colors">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
              className="w-6 h-6 border-4 border-black accent-black"
            />
            <span className="text-black font-black uppercase tracking-wider">
              CATEGORY IS ACTIVE AND VISIBLE
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-8 border-t-4 border-black">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white px-8 py-5 font-black uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CREATING CATEGORY...' : 'CREATE CATEGORY'}
          </button>
          <button
            type="button"
            onClick={() => returnTo ? router.push(returnTo) : router.back()}
            className="flex-1 bg-white text-black px-8 py-5 font-black uppercase tracking-wider hover:bg-gray-100 transition-colors border-4 border-black"
          >
            CANCEL
          </button>
        </div>
      </form>

      {/* Example Categories */}
      <div className="bg-yellow-400 border-8 border-black p-8 mb-6">
        <h3 className="text-xl font-black uppercase tracking-tight text-black mb-6 border-b-4 border-black pb-4">
          💡 EXAMPLE {formData.type === 'SERVICE' ? 'SERVICE' : 'PRODUCT'} CATEGORIES
        </h3>
        {formData.type === 'SERVICE' ? (
          <ul className="space-y-3 text-black">
            <li className="font-bold border-b-4 border-black pb-3">
              • <span className="font-black uppercase">MASSAGE THERAPY:</span> DEEP TISSUE, SWEDISH, HOT STONE
            </li>
            <li className="font-bold border-b-4 border-black pb-3">
              • <span className="font-black uppercase">SPA TREATMENTS:</span> FACIALS, BODY WRAPS, SCRUBS
            </li>
            <li className="font-bold border-b-4 border-black pb-3">
              • <span className="font-black uppercase">AROMATHERAPY:</span> ESSENTIAL OIL MASSAGES, DIFFUSION SESSIONS
            </li>
            <li className="font-bold">
              • <span className="font-black uppercase">WELLNESS:</span> MEDITATION, YOGA, REIKI
            </li>
          </ul>
        ) : (
          <ul className="space-y-3 text-black">
            <li className="font-bold border-b-4 border-black pb-3">
              • <span className="font-black uppercase">ESSENTIAL OILS:</span> LAVENDER, PEPPERMINT, EUCALYPTUS
            </li>
            <li className="font-bold border-b-4 border-black pb-3">
              • <span className="font-black uppercase">SKINCARE:</span> MOISTURIZERS, CLEANSERS, SERUMS
            </li>
            <li className="font-bold border-b-4 border-black pb-3">
              • <span className="font-black uppercase">MASSAGE TOOLS:</span> ROLLERS, HEATING PADS, MASSAGE BALLS
            </li>
            <li className="font-bold">
              • <span className="font-black uppercase">WELLNESS SUPPLEMENTS:</span> VITAMINS, HERBS, TEAS
            </li>
          </ul>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-white border-8 border-black p-8">
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 bg-black flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-black text-xl uppercase tracking-tight text-black mb-4">ABOUT CATEGORIES</p>
            <p className="font-bold uppercase tracking-wide text-black leading-relaxed">
              CATEGORIES HELP ORGANIZE YOUR {formData.type === 'SERVICE' ? 'SERVICES' : 'PRODUCTS'} AND 
              MAKE IT EASIER FOR CUSTOMERS TO FIND WHAT THEY'RE LOOKING FOR. YOU CAN CREATE AS MANY CATEGORIES 
              AS YOU NEED AND ASSIGN MULTIPLE {formData.type === 'SERVICE' ? 'SERVICES' : 'PRODUCTS'} TO EACH CATEGORY.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}