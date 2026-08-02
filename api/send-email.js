import nodemailer from 'nodemailer';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, from, subject, htmlBody, smtpUser, smtpPass } = req.body || {};

    const senderAddress = smtpUser || process.env.VITE_SENDER_EMAIL || 'hp.oumaroulife2023@gmail.com';
    const senderPassword = smtpPass || process.env.VITE_EMAIL_PASSWORD || 'usnlfnwdlutaj';
    const receiverAddress = to || process.env.VITE_RECEIVER_EMAIL || 'f.oumarou78@gmail.com';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: senderAddress,
        pass: senderPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: `"FOF-AI BI Assistant" <${senderAddress}>`,
      to: receiverAddress,
      subject: subject,
      html: htmlBody
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
