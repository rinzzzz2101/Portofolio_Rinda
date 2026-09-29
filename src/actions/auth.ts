"use server";

import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function sendPasswordOtp(targetEmail: string) {
  try {
    const email = (targetEmail || "").trim().toLowerCase();
    if (!email) return { success: false, error: "Email tidak valid." };

    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Simpan OTP ke database (upsert agar email unik)
    await prisma.otpToken.upsert({
      where: { email },
      update: { code, expiresAt },
      create: { email, code, expiresAt },
    });

    console.log(`[OTP] Generated OTP for ${email}: ${code}`);

    let sentViaSmtp = false;
    let smtpErrorMessage = "";

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;
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
          from: `"Portfolio Admin" <${smtpUser}>`,
          to: email,
          subject: "Kode Verifikasi Ganti Sandi - Portfolio",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #09090b; color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #27272a;">
              <h2 style="color: #ffffff; margin-top: 0;">Verifikasi Ganti Sandi</h2>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                Kami menerima permintaan untuk mengubah kata sandi akun Admin Portfolio Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff; background: #18181b; padding: 14px 28px; border-radius: 8px; border: 1px solid #27272a;">
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
      } catch (mailError: any) {
        console.error("[OTP] Gagal mengirim via SMTP:", mailError);
        smtpErrorMessage = mailError?.message || "Gagal mengirim email melalui SMTP";
      }

      if (!sentViaSmtp) {
        return {
          success: false,
          error: `Gagal mengirim email OTP ke ${email}: ${smtpErrorMessage}`,
        };
      }
    }

    return {
      success: true,
      sentViaSmtp,
      // Hanya kembalikan code jika SMTP belum dikonfigurasi sama sekali (mode dev lokal)
      code: sentViaSmtp ? undefined : code,
      message: sentViaSmtp
        ? `Kode verifikasi telah dikirim ke email: ${email}`
        : `Mode simulasi lokal: Kode OTP Anda adalah ${code}`,
    };
  } catch (error) {
    console.error("[OTP Error]:", error);
    return { success: false, error: "Gagal memproses kode verifikasi." };
  }
}

export async function verifyPasswordOtp(targetEmail: string, inputCode: string) {
  try {
    const email = (targetEmail || "").trim().toLowerCase();

    const stored = await prisma.otpToken.findUnique({ where: { email } });

    if (!stored) {
      return { success: false, error: "Kode verifikasi belum dikirim atau sudah kadaluarsa. Silakan kirim ulang kode!" };
    }

    if (new Date() > stored.expiresAt) {
      await prisma.otpToken.delete({ where: { email } });
      return { success: false, error: "Kode verifikasi sudah kadaluarsa. Silakan minta kode baru!" };
    }

    if (stored.code !== inputCode.trim()) {
      return { success: false, error: "Kode verifikasi salah! Periksa kembali kode yang dikirimkan." };
    }

    // Hapus setelah berhasil diverifikasi
    await prisma.otpToken.delete({ where: { email } });
    return { success: true };
  } catch (error) {
    console.error("[OTP Verify Error]:", error);
    return { success: false, error: "Terjadi kesalahan saat memverifikasi kode." };
  }
}

export async function updateAdminPassword(newPassword: string) {
  try {
    const trimmed = (newPassword || "").trim();
    if (!trimmed || trimmed.length < 6) {
      return { success: false, error: "Kata sandi minimal 6 karakter." };
    }

    await prisma.setting.upsert({
      where: { id: "singleton" },
      update: { adminPassword: trimmed },
      create: { id: "singleton", adminPassword: trimmed, description: "", about: "", cvUrl: "" },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Kata sandi berhasil diperbarui dan disimpan ke database!" };
  } catch (error) {
    console.error("[Update Password Error]:", error);
    return { success: false, error: "Gagal menyimpan kata sandi ke database." };
  }
}

export async function resetPasswordWithOtp(targetEmail: string, inputCode: string, newPassword: string) {
  try {
    const verifyRes = await verifyPasswordOtp(targetEmail, inputCode);
    if (!verifyRes.success) {
      return verifyRes;
    }
    return await updateAdminPassword(newPassword);
  } catch (error) {
    console.error("[Reset Password Error]:", error);
    return { success: false, error: "Gagal mereset kata sandi." };
  }
}

export async function loginAdmin(email: string, password: string) {
  try {
    const inputEmail = (email || "").trim().toLowerCase();
    const inputPass = (password || "").trim();

    if (!inputEmail || !inputPass) {
      return { success: false, error: "Email dan password wajib diisi." };
    }

    // Ambil setting dari DB (mungkin null jika row belum ada)
    const setting = await prisma.setting.findUnique({
      where: { id: "singleton" },
    });

    console.log("[Login Debug] setting found:", !!setting);
    console.log("[Login Debug] adminPassword from DB:", setting?.adminPassword ? "(set)" : "(null/empty)");
    console.log("[Login Debug] email from DB:", setting?.email || "(empty)");

    // Email yang valid: dari DB (jika ada & tidak kosong), atau fallback hardcoded
    const dbEmail = (setting?.email || "").trim().toLowerCase();
    const fallbackEmail = "rinda.dev21@gmail.com";
    const validEmail = dbEmail || fallbackEmail;
    const isValidEmail = inputEmail === validEmail || inputEmail === fallbackEmail;

    // Password: dari DB jika ada & tidak kosong, fallback default
    const dbPassword = (setting?.adminPassword || "").trim();
    const registeredPassword = dbPassword || "12345678";

    console.log("[Login Debug] inputEmail:", inputEmail, "| validEmail:", validEmail, "| isValidEmail:", isValidEmail);
    console.log("[Login Debug] passwordMatch:", inputPass === registeredPassword);

    if (!isValidEmail || inputPass !== registeredPassword) {
      return { success: false, error: "Email atau password salah!" };
    }

    const cookieStore = await cookies();
    cookieStore.set("dummy_auth", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("[Login Error]:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat memproses login." };
  }
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("dummy_auth");
    return { success: true };
  } catch (error) {
    console.error("[Logout Error]:", error);
    return { success: false };
  }
}

