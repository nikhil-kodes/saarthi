import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { r2Storage } from '@/lib/storage/r2';

/**
 * POST /api/storage/upload
 * Generates a presigned upload URL for Cloudflare R2
 * Body: { fileName, contentType, documentType, businessId }
 *
 * GET /api/storage/upload?key=...
 * Generates a presigned download URL for a given R2 key
 */

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fileName, contentType, documentType, businessId } = body;

    if (!fileName || !contentType || !businessId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fileName, contentType, businessId' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { success: false, error: `File type ${contentType} not allowed. Accepted: PDF, JPEG, PNG, WEBP, HEIC, DOC, DOCX` },
        { status: 400 }
      );
    }

    // Check R2 is configured
    if (!r2Storage.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Object storage not configured. Please set R2 environment variables.' },
        { status: 503 }
      );
    }

    // Generate unique R2 key
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `businesses/${businessId}/${documentType || 'general'}/${timestamp}_${sanitizedName}`;

    // Generate presigned upload URL (valid for 10 minutes)
    const presignedUrl = await r2Storage.getPresignedUploadUrl(fileKey, contentType, 600);

    // Construct the public URL
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;
    const fileUrl = publicDomain
      ? `${publicDomain}/${fileKey}`
      : `https://${process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileKey}`;

    return NextResponse.json({
      success: true,
      data: {
        presignedUrl,
        fileKey,
        fileUrl,
        expiresIn: 600,
      },
    });
  } catch (error: any) {
    console.error('Storage upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const key = req.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: key' },
        { status: 400 }
      );
    }

    if (!r2Storage.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Object storage not configured' },
        { status: 503 }
      );
    }

    // Generate presigned download URL (valid for 1 hour)
    const downloadUrl = await r2Storage.getPresignedDownloadUrl(key, 3600);

    return NextResponse.json({
      success: true,
      data: { downloadUrl, expiresIn: 3600 },
    });
  } catch (error: any) {
    console.error('Storage download error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
