import { NextResponse } from 'next/server';
import { createQrisTransaction } from '@/lib/klikqris';

export async function POST(request: Request) {
  try {
    const { orderId, amount, keterangan } = await request.json();
    
    if (!orderId || !amount) {
      return NextResponse.json({ status: false, message: 'Missing orderId or amount' }, { status: 400 });
    }

    const result = await createQrisTransaction(orderId, amount, keterangan || `Pembayaran Order ${orderId}`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API_CREATE_QRIS_ERROR]', error);
    return NextResponse.json({ status: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
