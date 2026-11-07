const env = require('../../config/env');

module.exports = ({ user, resetToken }) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;
  const subject = 'Private Chef Missy - Password Reset Request';
  const message = `
Hello ${user.name},

You requested to reset your password for Private Chef Missy.

Please click the following link to choose a new password (valid for 1 hour):
${resetUrl}

If you did not request this, please ignore this email and your password will remain unchanged.

Warm regards,
Private Chef Missy
`;

  return { subject, text: message.trim() };
};
