import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    // Sistem Keamanan Webhook: Validasi x-api-key di Request Headers
    const apiKeyHeader = request.headers.get('x-api-key');
    const expectedApiKey = process.env.KLIKQRIS_API_KEY || 'QDHKVXNSOHPdJbKWACwFieYWXsHH8Vmhdr2SKQXP';

    if (apiKeyHeader !== expectedApiKey) {
      console.warn('[WEBHOOK_UNAUTHORIZED] Invalid API Key received in headers:', apiKeyHeader);
      return NextResponse.json({ status: false, message: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    const payload = await request.json();
    console.log('[KLIKQRIS_WEBHOOK_RECEIVED]', payload);

    const { order_id, status, total_amount, signature } = payload;

    if (!order_id || !status) {
      return NextResponse.json({ status: false, message: 'Invalid payload' }, { status: 400 });
    }

    // Hanya proses status PAID / SUCCESS
    if (status === 'PAID' || status === 'SUCCESS') {
      if (supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        
        // 1. Cari Order di DB
        const { data: order, error: orderErr } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('order_code', order_id)
          .single();

        if (orderErr || !order) {
          console.error('[WEBHOOK_ORDER_NOT_FOUND]', order_id, orderErr);
          return NextResponse.json({ status: false, message: 'Order not found in database' }, { status: 404 });
        }

        // 2. Periksa status order saat ini. Jika sudah PAID, SUCCESS, dll abaikan
        if (['queued', 'in_progress', 'delivered', 'completed'].includes(order.status)) {
          return NextResponse.json({ status: true, message: 'Already processed' }, { status: 200 });
        }

        // 3. Update data payment lunas
        const { error: payErr } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('order_id', order.id);

        if (payErr) {
          console.error('[WEBHOOK_PAYMENT_UPDATE_FAILED]', payErr);
        }

        // 4. Hitung workload control: periksa jumlah active order
        const { data: activeOrders } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('status', 'in_progress');

        const { data: maxActiveSetting } = await supabaseAdmin
          .from('settings')
          .select('value')
          .eq('key', 'max_active_orders')
          .single();

        const activeCount = activeOrders?.length || 0;
        const maxActive = parseInt(maxActiveSetting?.value || '1');

        let targetStatus = 'queued';
        if (activeCount < maxActive) {
          targetStatus = 'in_progress';
        }

        // 5. Update status order
        const { error: orderUpdateErr } = await supabaseAdmin
          .from('orders')
          .update({
            status: targetStatus,
            progress: targetStatus === 'in_progress' ? 10 : 0
          })
          .eq('id', order.id);

        if (orderUpdateErr) {
          console.error('[WEBHOOK_ORDER_UPDATE_FAILED]', orderUpdateErr);
          return NextResponse.json({ status: false, message: 'Failed to update order status' }, { status: 500 });
        }

        // 6. Buat Notification untuk User & Admin
        await supabaseAdmin.from('notifications').insert([
          {
            user_id: order.user_id,
            title: 'Pembayaran Berhasil (KlikQRIS)',
            message: `Pembayaran Rp ${Number(total_amount).toLocaleString('id-ID')} lunas. Status order Anda: ${targetStatus === 'in_progress' ? 'Diproses' : 'Masuk Antrean'}.`,
            type: 'success',
            link_url: `/dashboard/user/order/${order.id}`
          },
          {
            user_id: 'user-id-riyan', // admin
            title: 'Pembayaran Diterima (KlikQRIS)',
            message: `Order ${order_id} berhasil dibayar lunas otomatis via KlikQRIS.`,
            type: 'payment',
            link_url: `/dashboard/admin/order/${order.id}`
          }
        ]);

        console.log('[WEBHOOK_PROCESSING_SUCCESS]', order_id);
      } else {
        console.warn('[WEBHOOK_SUPABASE_NOT_CONFIGURED] Webhook received but Supabase variables not set.');
      }
    }

    // Selalu respon 200 OK untuk klikqris webhook
    return NextResponse.json({ status: true, message: 'Webhook received and processed' }, { status: 200 });
  } catch (error: any) {
    console.error('[API_WEBHOOK_ERROR]', error);
    return NextResponse.json({ status: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
