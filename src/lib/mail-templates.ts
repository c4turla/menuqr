export function getPaymentSuccessEmailHtml(params: {
  userName: string;
  orderId: string;
  planName: string;
  billingPeriod: string;
  amount: number;
  periodEnd: string;
  appUrl: string;
}) {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(params.amount);

  const planLabel = params.planName.toUpperCase();
  const periodLabel = params.billingPeriod === "yearly" ? "Tahunan" : "Bulanan";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0;">
        <img src="cid:logo" alt="MenuQR Logo" style="height: 40px; margin-bottom: 10px;" />
        <h2 style="color: #f97316; margin: 0;">Pembayaran Berhasil!</h2>
      </div>
      
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p>Halo <strong>${params.userName}</strong>,</p>
        <p>Terima kasih! Pembayaran Anda telah kami terima dan paket langganan Anda berhasil diaktifkan/diperbarui.</p>
        
        <div style="margin: 25px 0; padding: 20px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Detail Pembayaran</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Order ID</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${params.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Paket Langganan</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${planLabel} - ${periodLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Total Bayar</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f97316;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Berlaku Hingga</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${params.periodEnd}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${params.appUrl}/dashboard/billing" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Masuk ke Dashboard</a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
        <p>Email ini dikirim otomatis oleh sistem MenuQR. Mohon jangan balas ke email ini.</p>
        <p>&copy; ${new Date().getFullYear()} MenuQR. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function getPaymentFailedEmailHtml(params: {
  userName: string;
  orderId: string;
  planName: string;
  billingPeriod: string;
  appUrl: string;
}) {
  const planLabel = params.planName.toUpperCase();
  const periodLabel = params.billingPeriod === "yearly" ? "Tahunan" : "Bulanan";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0;">
        <img src="cid:logo" alt="MenuQR Logo" style="height: 40px; margin-bottom: 10px;" />
        <h2 style="color: #ef4444; margin: 0;">Pembayaran Gagal</h2>
      </div>
      
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p>Halo <strong>${params.userName}</strong>,</p>
        <p>Mohon maaf, transaksi Anda dengan Order ID <strong>${params.orderId}</strong> untuk langganan paket <strong>${planLabel} - ${periodLabel}</strong> gagal diproses.</p>
        <p>Hal ini mungkin disebabkan oleh beberapa hal, seperti koneksi terputus atau batas waktu pembayaran yang telah habis.</p>
        <p>Anda dapat mencoba melakukan pembayaran kembali melalui dashboard Anda.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${params.appUrl}/dashboard/billing" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Coba Bayar Lagi</a>
        </div>
      </div>
    </div>
  `;
}

export function getPaymentExpiredEmailHtml(params: {
  userName: string;
  orderId: string;
  planName: string;
  billingPeriod: string;
  appUrl: string;
}) {
  const planLabel = params.planName.toUpperCase();
  const periodLabel = params.billingPeriod === "yearly" ? "Tahunan" : "Bulanan";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="text-align: center; padding: 20px 0;">
        <img src="cid:logo" alt="MenuQR Logo" style="height: 40px; margin-bottom: 10px;" />
        <h2 style="color: #f59e0b; margin: 0;">Pembayaran Kedaluwarsa</h2>
      </div>
      
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p>Halo <strong>${params.userName}</strong>,</p>
        <p>Batas waktu pembayaran untuk Order ID <strong>${params.orderId}</strong> (Paket ${planLabel} - ${periodLabel}) telah habis.</p>
        <p>Jika Anda masih ingin melanjutkan berlangganan, silakan buat tagihan baru dari dashboard Anda.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${params.appUrl}/dashboard/billing" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Buat Tagihan Baru</a>
        </div>
      </div>
    </div>
  `;
}
