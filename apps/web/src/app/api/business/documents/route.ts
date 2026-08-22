import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = req.nextUrl.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Missing businessId' }, { status: 400 });
    }

    const { data: docs, error } = await supabase
      .from('business_documents')
      .select('*')
      .eq('business_id', businessId);

    if (error) throw error;

    return NextResponse.json({ success: true, data: { documents: docs } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, documentType, fileName, fileKey, fileUrl, mimeType, fileSizeBytes } = body;

    // Check membership (simplistic check for brevity)
    const { data: member, error: memberError } = await supabase
      .from('business_members')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ success: false, error: 'Unauthorized to add documents for this business' }, { status: 403 });
    }

    const { data: doc, error } = await supabase
      .from('business_documents')
      .insert({
        business_id: businessId,
        uploaded_by: user.id,
        document_type: documentType,
        file_name: fileName,
        file_key: fileKey,
        file_url: fileUrl,
        mime_type: mimeType,
        file_size_bytes: fileSizeBytes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: { document: doc } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
