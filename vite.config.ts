import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import nodemailer from 'nodemailer';

// Disable TLS rejection for local antivirus/proxy compatibility
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const emailApiPlugin = (): Plugin => ({
  name: 'email-api-plugin',
  configureServer(server) {
    server.middlewares.use('/api/send-email', (req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { to, from, subject, htmlBody, smtpUser, smtpPass } = data;

            const senderAddress = smtpUser || 'hp.oumaroulife2023@gmail.com';
            const senderPassword = smtpPass || 'wglslbr';
            const receiverAddress = to || 'f.oumarou78@gmail.com';

            console.log(`[SMTP INITIATED] Connecting to Google SMTP (smtp.gmail.com:587) for receiver ${receiverAddress}...`);

            // Primary Transporter: Port 587 STARTTLS with IPv4 (family: 4) to bypass ISP timeouts
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false, // STARTTLS
              family: 4,     // Force IPv4 to prevent IPv6 ETIMEDOUT
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

            console.log(`[SMTP SUCCESS] Email delivered successfully! Message ID: ${info.messageId}`);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, messageId: info.messageId }));
          } catch (error: any) {
            let userFriendlyError = error.message;

            if (error.message.includes('535') || error.message.includes('Username and Password not accepted')) {
              userFriendlyError = 'Gmail Authentication Failed (535 5.7.8): Google requires a 16-character Google App Password instead of a standard password. Please generate an App Password in your Google Account Security settings.';
            }

            console.error('[SMTP FAILURE]', userFriendlyError);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: userFriendlyError }));
          }
        });
      } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), emailApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true
  }
});
