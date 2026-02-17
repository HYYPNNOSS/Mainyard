import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'product-images',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Limit max size
            { quality: 'auto' }, // Auto quality optimization
            { fetch_format: 'auto' } // Auto format (WebP when supported)
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: (result as any).secure_url }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}