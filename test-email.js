import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shreenithya111@gmail.com',
    pass: 'qzoy xxfl hvmq htbn', // User provided app password
  },
});

async function runTest() {
  try {
    const info = await transporter.sendMail({
      from: 'AuraOps System <shreenithya111@gmail.com>',
      to: 'shreenithya111@gmail.com',
      subject: 'AuraOps SMTP Test',
      text: 'If you are receiving this, your Nodemailer OTP configuration is working perfectly!',
    });
    console.log('✅ Test email successfully sent!', info.response);
  } catch (error) {
    console.error('❌ Failed to send email.', error);
  }
}

runTest();
