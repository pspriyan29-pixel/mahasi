import { NextResponse } from 'next/server';
import { checkQrisStatus } from '@/lib/klikqris';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ status: false, message: 'Missing orderId parameter' }, { status: 400 });
    }

    const result = await checkQrisStatus(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API_CHECK_STATUS_ERROR]', error);
    return NextResponse.json({ status: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
