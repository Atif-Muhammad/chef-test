const nodemailer = require('nodemailer');
const env = require('../../config/env');
const emailTemplates = require('../../utils/emailTemplates');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (env.SMTP_USER && env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      // Development fallback mock transporter
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('[MOCK EMAIL SENT]', {
            to: mailOptions.to,
            subject: mailOptions.subject,
            text: mailOptions.text,
          });
          return { messageId: 'mock-email-' + Date.now() };
        },
      };
    }
  }
  return transporter;
}

async function sendSubmissionConfirmation(user, visit, dishes) {
  const t = getTransporter();
  const { subject, text } = emailTemplates.orderSubmission({ user, visit, dishes });
  return t.sendMail({
    from: env.EMAIL_FROM,
    to: user.email,
    subject,
    text,
  });
}

async function sendVisitReminder(user, visit) {
  const t = getTransporter();
  const { subject, text } = emailTemplates.visitReminder({ user, visit });
  return t.sendMail({
    from: env.EMAIL_FROM,
    to: user.email,
    subject,
    text,
  });
}

async function sendPasswordResetEmail(user, resetToken) {
  const t = getTransporter();
  const { subject, text } = emailTemplates.passwordReset({ user, resetToken });
  return t.sendMail({
    from: env.EMAIL_FROM,
    to: user.email,
    subject,
    text,
  });
}

async function sendVisitStatusUpdateEmail(user, visit, updateType) {
  const t = getTransporter();
  const { subject, text } = emailTemplates.visitStatusUpdate({ user, visit, updateType });
  return t.sendMail({
    from: env.EMAIL_FROM,
    to: user.email,
    subject,
    text,
  });
}

async function sendShoppingListSharedEmail(user, visit, shoppingList) {
  const t = getTransporter();
  const { subject, text } = emailTemplates.shoppingListShared({ user, visit, shoppingList });
  return t.sendMail({
    from: env.EMAIL_FROM,
    to: user.email,
    subject,
    text,
  });
}

async function sendIncompleteAppointmentInvitation(user, visit, missingItems = []) {
  const t = getTransporter();
  const { subject, text } = emailTemplates.incompleteAppointment({ user, visit, missingItems });
  return t.sendMail({
    from: env.EMAIL_FROM,
    to: user.email,
    subject,
    text,
  });
}

module.exports = {
  sendSubmissionConfirmation,
  sendVisitReminder,
  sendPasswordResetEmail,
  sendVisitStatusUpdateEmail,
  sendShoppingListSharedEmail,
  sendIncompleteAppointmentInvitation,
};
