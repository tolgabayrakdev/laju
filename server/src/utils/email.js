import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function createTransporter() {
  if (!env.smtp.host) return null;

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
}

export async function sendPasswordChangedEmail(to) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[DEV] Şifre değiştirildi bildirimi (${to})`);
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Şifreniz başarıyla güncellendi',
    html: `
      <p>Şifreniz başarıyla güncellenmiştir.</p>
      <p>Eğer bu değişikliği siz yapmadıysanız lütfen hemen bizimle iletişime geçin.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[DEV] Şifre sıfırlama linki (${to}):\n${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Şifrenizi sıfırlayın',
    html: `
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Bu bağlantı 1 saat geçerlidir.</p>
      <p>Eğer şifre sıfırlamayı siz istemediyseniz bu e-postayı görmezden gelin.</p>
    `,
  });
}
