// lib/sendgrid/index.ts
import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface SendEmailProps {
  to: string;
  fullName: string;
}

export const sendWaitlistConfirmation = async ({ to, fullName }: SendEmailProps) => {
  const msg = {
    to,
    from: {
      email: 'your-verified-sender@yourdomain.com',
      name: 'Lokin Team'
    },
    templateId: 'd-your-template-id', // Create this in Sendgrid
    dynamicTemplateData: {
      fullName,
      currentYear: new Date().getFullYear()
    }
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
