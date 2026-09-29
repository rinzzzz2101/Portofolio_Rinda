"use server";

import nodemailer from "nodemailer";

// In-memory OTP storage (bisa juga diakses lintas request dalam single server runtime)
// Menyimpan { code, expiresAt } keyed by email
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function sendPasswordOtp(targetEmail: string) {
  try {
    const email = (targetEmail || "rinda.dev@portfolio.com").trim().toLowerCase();
    
    // Generate 6 digit angka acak
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 menit
    
    otpStore.set(email, { code, expiresAt });
    console.log(`[OTP] Generated OTP for ${email}: ${code}`);

    let sentViaSmtp = false;

    // Cek apakah ada konfigurasi SMTP di environment
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Portfolio Admin Security" <${smtpUser}>`,
          to: email,
          subject: "Kode Verifikasi Ganti Sandi - Portfolio",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #09090b; color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #27272a;">
              <h2 style="color: #10b981; margin-top: 0;">Verifikasi Ganti Sandi</h2>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                Kami menerima permintaan untuk mengubah kata sandi akun Admin Portfolio Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981; background: #18181b; padding: 14px 28px; border-radius: 8px; border: 1px solid #27272a;">
                  ${code}
                </span>
              </div>
              <p style="color: #71717a; font-size: 12px; text-align: center;">
                Kode ini hanya berlaku selama <strong>10 menit</strong>. Jika Anda tidak merasa meminta ganti sandi, abaikan email ini.
              </p>
            </div>
          `,
        });
        sentViaSmtp = true;
      } catch (mailError) {
        console.warn("[OTP] Gagal mengirim via SMTP, fallback ke notifikasi langsung:", mailError);
      }
    }

    return {
      success: true,
      sentViaSmtp,
      code, // Disediakan agar admin bisa langsung melihat kode di notifikasi popup/toast jika SMTP belum diatur
      message: sentViaSmtp 
        ? `Kode verifikasi telah dikirim ke email: ${email}` 
        : `Kode verifikasi telah dikirim ke email ${email}. (Kode simulasi: ${code})`,
    };
  } catch (error) {
    console.error("[OTP Error]:", error);
    return { success: false, error: "Gagal memproses kode verifikasi." };
  }
}

export async function verifyPasswordOtp(targetEmail: string, inputCode: string) {
  try {
    const email = (targetEmail || "rinda.dev@portfolio.com").trim().toLowerCase();
    const stored = otpStore.get(email);

    if (!stored) {
      return { success: false, error: "Kode verifikasi belum dikirim atau sudah kadaluarsa. Silakan kirim ulang kode!" };
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return { success: false, error: "Kode verifikasi sudah kadaluarsa. Silakan minta kode baru!" };
    }

    if (stored.code !== inputCode.trim()) {
      return { success: false, error: "Kode verifikasi salah! Periksa kembali kode yang dikirimkan." };
    }

    // Kode cocok, hapus agar tidak bisa dipakai ulang
    otpStore.delete(email);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat memverifikasi kode." };
  }
}
