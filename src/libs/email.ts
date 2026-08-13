import { Env } from '../config/Env';
import { transporter } from './nodemailer';

interface SendOtpEmailParams {
  to: string;
  otp: string;
}

export const sendRegistrationOtpEmail = async ({ to, otp }: SendOtpEmailParams) => {
  const mailOptions = {
    from: `"Verification Team" <${process.env.EMAIL_FROM || Env.EMAIL_SERVER_USER}>`,
    to,
    subject: 'Kode Verifikasi Pendaftaran Anda',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333333; text-align: center;">Verifikasi Akun Anda</h2>
        <p>Terima kasih telah mendaftar. Gunakan kode OTP di bawah ini untuk menyelesaikan proses verifikasi pendaftaran akun Anda:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0; border-radius: 6px;">
          ${otp}
        </div>
        <p style="color: #666666; font-size: 14px;">Kode OTP ini hanya berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapa pun.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #999999; font-size: 12px; text-align: center;">Jika Anda tidak merasa mendaftar akun ini, silakan abaikan email ini.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};