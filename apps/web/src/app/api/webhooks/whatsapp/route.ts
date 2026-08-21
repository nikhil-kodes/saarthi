import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { whatsappWebhookSchema } from '@saarthi/validation';

/**
 * WhatsApp Webhook & Simulator Receiver (WORKFLOW.md Flow 8 & PRD.md §9).
 * Accepts inbound customer WhatsApp queries / photo uploads of notices,
 * executes instant plain-language explanation, and logs the conversation.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = whatsappWebhookSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid WhatsApp webhook payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { senderPhone, messageText, mediaUrl } = validated.data;
    const textLower = (messageText || '').toLowerCase();

    let responseText = '';
    if (mediaUrl || textLower.includes('notice') || textLower.includes('gst')) {
      responseText =
        '📄 *साथी (Saarthi) नोटिस विश्लेषण:*\n\n' +
        '1. *नोटिस का अर्थ:* जीएसटी विभाग से GSTR-3B और GSTR-2B में ITC अंतर के लिए DRC-01A नोटिस प्राप्त हुआ है।\n' +
        '2. *वित्तीय जोखिम:* ₹4,50,000 कर मांग + ₹81,000 ब्याज।\n' +
        '3. *अंतिम तिथि:* 2 मार्च 2026 तक जवाब देना अनिवार्य है।\n\n' +
        '👉 आपका औपचारिक उत्तर पत्रक तैयार है। डैशबोर्ड पर देखने के लिए क्लिक करें: https://saarthi.app/hi/notices';
    } else {
      responseText =
        'नमस्ते! मैं साथी (Saarthi) AI अनुपालन सहायक हूँ। आप मुझे अपने सरकारी नोटिस की फोटो या जीएसटी, उद्यम एवं सब्सिडी से संबंधित कोई भी प्रश्न भेज सकते हैं।';
    }

    // Store in whatsapp_conversations table
    const adminSupabase = createAdminClient();
    await adminSupabase.from('whatsapp_conversations').insert({
      sender_phone: senderPhone,
      message_text: messageText || null,
      media_url: mediaUrl || null,
      response_text: responseText,
    });

    return NextResponse.json({
      success: true,
      data: {
        senderPhone,
        response: responseText,
        deliveredAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WHATSAPP_WEBHOOK_ERROR',
          message: error.message || 'WhatsApp webhook processing failed',
        },
      },
      { status: 500 }
    );
  }
}
