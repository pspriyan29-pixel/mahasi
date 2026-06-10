// KlikQRIS Payment Gateway Integration Helper

const API_KEY = process.env.KLIKQRIS_API_KEY || 'QDHKVXNSOHPdJbKWACwFieYWXsHH8Vmhdr2SKQXP';
const MERCHANT_ID = Number(process.env.KLIKQRIS_MERCHANT_ID || '177929799620');
const BASE_URL = 'https://klikqris.com/api';

export interface KlikQrisCreateResponse {
  status: boolean;
  message: string;
  data: {
    order_id: string;
    nama_toko: string;
    tanggal: string;
    mdr: string;
    redirect_url: string;
    amount_uniq: string;
    amount: string;
    total_amount: string;
    status: string;
    qris_url: string;
    expired_at: string;
    signature: string;
    qris_image?: string; // Base64 image
    keterangan: string;
  };
}

export interface KlikQrisStatusResponse {
  status: boolean;
  message: string;
  data: {
    order_id: string;
    nama_toko: string;
    tanggal: string;
    total_amount: string;
    status: 'SUCCESS' | 'PENDING' | 'EXPIRED' | string;
    qris_url: string | null;
    paid_at: string | null;
    signature: string;
    keterangan: string;
  };
}

/**
 * Membuat transaksi QRIS dinamis baru di klikqris.com
 */
export async function createQrisTransaction(orderId: string, amount: number, keterangan: string): Promise<KlikQrisCreateResponse> {
  try {
    const response = await fetch(`${BASE_URL}/qris/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'id_merchant': MERCHANT_ID.toString()
      },
      body: JSON.stringify({
        order_id: orderId,
        id_merchant: MERCHANT_ID,
        amount: Math.round(amount),
        keterangan: keterangan
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create KlikQRIS transaction: ${response.statusText}`);
    }

    const data = await response.json();
    return data as KlikQrisCreateResponse;
  } catch (error) {
    console.error('[KLIKQRIS_CREATE_ERROR]', error);
    throw error;
  }
}

/**
 * Mengecek status transaksi QRIS di klikqris.com secara manual
 */
export async function checkQrisStatus(orderId: string): Promise<KlikQrisStatusResponse> {
  try {
    const response = await fetch(`${BASE_URL}/qris/status/${orderId}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'id_merchant': MERCHANT_ID.toString()
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check KlikQRIS status: ${response.statusText}`);
    }

    const data = await response.json();
    return data as KlikQrisStatusResponse;
  } catch (error) {
    console.error('[KLIKQRIS_STATUS_ERROR]', error);
    throw error;
  }
}
