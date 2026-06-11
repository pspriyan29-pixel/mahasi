// Helper integrasi WhatsApp notification

export function getWhatsAppLink(
  orderCode: string,
  userName: string,
  serviceName: string,
  deadline: string,
  price: number
) {
  const text = `🔔 *FlashWork - Order Baru*
Kode: ${orderCode}
User: ${userName}
Layanan: ${serviceName}
Deadline: ${deadline}
Estimasi: Rp ${price.toLocaleString('id-ID')}
Status: Menunggu Review Admin

Cek dashboard admin untuk approve/tolak.`;
  
  return `https://wa.me/6285378963269?text=${encodeURIComponent(text)}`;
}

export async function sendWhatsAppNotification(message: string): Promise<{ success: boolean; mock?: boolean; error?: any; result?: any }> {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const target = process.env.WHATSAPP_TARGET_NUMBER || '6285378963269';

  if (!apiKey || apiKey === 'your-whatsapp-gateway-key') {
    console.log(`[MOCK_WA_NOTIFICATION] Target: ${target}\nMessage:\n${message}`);
    return { success: true, mock: true };
  }

  try {
    // Implementasi default menggunakan gateway populer Fonnte
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target,
        message,
      }),
    });

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('[ERR_WHATSAPP_SEND] Failed to send WhatsApp message:', error);
    return { success: false, error };
  }
}
