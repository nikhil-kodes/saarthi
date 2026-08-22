import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * MSMED Act, 2006 — Section 15 & 16 Delayed Payment Recovery Engine
 * Statutory Interest Rate: 3x RBI Bank Rate (Current Bank Rate: 6.75% -> 20.25% p.a.)
 */
const RBI_BANK_RATE = 6.75;
const STATUTORY_INTEREST_RATE = RBI_BANK_RATE * 3; // 20.25% p.a.

// In-memory storage fallback for local development
let memoryClaims: any[] = [
  {
    id: 'claim-1',
    buyer_name: 'Apex Industrial Logistics Ltd',
    buyer_gstin: '09AAACA1234F1Z5',
    invoice_number: 'INV/2025/892',
    invoice_date: '2025-11-10',
    due_date: '2025-12-25', // 45 days from invoice
    invoice_amount: 450000.0,
    amount_received: 0.0,
    delay_days: 58,
    interest_rate: STATUTORY_INTEREST_RATE,
    interest_amount: 14782.5,
    status: 'pending',
    notes: 'Packaging boxes batch #4 delivered to Kanpur warehouse. Delivery challan signed.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'claim-2',
    buyer_name: 'Metro Retail Marts Pvt Ltd',
    buyer_gstin: '07BBBCB5678G2Z1',
    invoice_number: 'INV/2025/944',
    invoice_date: '2025-12-01',
    due_date: '2026-01-15',
    invoice_amount: 185000.0,
    amount_received: 0.0,
    delay_days: 37,
    interest_rate: STATUTORY_INTEREST_RATE,
    interest_amount: 3848.2,
    status: 'acknowledged',
    notes: 'Jaggery powder 200kg shipment.',
    created_at: new Date().toISOString(),
  },
];

function calculateCompoundInterest(principal: number, dueDateStr: string): { delayDays: number; interest: number } {
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - due.getTime());
  const delayDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (delayDays <= 0) {
    return { delayDays: 0, interest: 0 };
  }

  // Monthly compound interest at 3x RBI rate: A = P(1 + r/n)^(nt) - P
  const months = delayDays / 30.416;
  const monthlyRate = (STATUTORY_INTEREST_RATE / 100) / 12;
  const totalAmount = principal * Math.pow(1 + monthlyRate, months);
  const interest = Math.round((totalAmount - principal) * 100) / 100;

  return { delayDays, interest };
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let claims = [...memoryClaims];

    // Recalculate interest live for each claim
    claims = claims.map((c) => {
      const { delayDays, interest } = calculateCompoundInterest(c.invoice_amount - (c.amount_received || 0), c.due_date);
      return {
        ...c,
        delay_days: delayDays,
        interest_rate: STATUTORY_INTEREST_RATE,
        interest_amount: interest,
        total_claim_amount: Math.round(((c.invoice_amount - (c.amount_received || 0)) + interest) * 100) / 100,
      };
    });

    const totalDelayedPrincipal = claims.reduce((acc, c) => acc + (c.invoice_amount - (c.amount_received || 0)), 0);
    const totalStatutoryInterest = claims.reduce((acc, c) => acc + c.interest_amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        claims,
        statutoryRule: {
          actName: 'Micro, Small and Medium Enterprises Development (MSMED) Act, 2006',
          section15: 'Mandatory 45-day maximum credit period for MSME suppliers',
          section16: `Mandatory compound interest at 3x RBI Bank Rate (${STATUTORY_INTEREST_RATE}% p.a.) with monthly rests`,
          section18: '1-Click Dispute Escalation to MSME Facilitation Council (Samadhan Portal)',
          currentRbiBankRate: `${RBI_BANK_RATE}%`,
          statutoryInterestRate: `${STATUTORY_INTEREST_RATE}%`,
        },
        summary: {
          totalClaims: claims.length,
          totalDelayedPrincipal,
          totalStatutoryInterest,
          totalRecoverable: totalDelayedPrincipal + totalStatutoryInterest,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { buyerName, buyerGstin, invoiceNumber, invoiceDate, dueDate, invoiceAmount, notes } = body;

    if (!buyerName || !invoiceNumber || !invoiceDate || !dueDate || !invoiceAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { delayDays, interest } = calculateCompoundInterest(Number(invoiceAmount), dueDate);

    const newClaim = {
      id: `claim-${Date.now()}`,
      buyer_name: buyerName,
      buyer_gstin: buyerGstin || '',
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      invoice_amount: Number(invoiceAmount),
      amount_received: 0.0,
      delay_days: delayDays,
      interest_rate: STATUTORY_INTEREST_RATE,
      interest_amount: interest,
      status: 'pending',
      notes: notes || '',
      created_at: new Date().toISOString(),
    };

    memoryClaims.unshift(newClaim);

    return NextResponse.json({
      success: true,
      data: newClaim,
      message: 'Delayed payment claim registered with automatic MSMED Section 16 interest calculation.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
