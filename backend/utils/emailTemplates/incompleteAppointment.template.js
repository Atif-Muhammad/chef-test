const env = require('../../config/env');

module.exports = ({ user, visit, missingItems = [] }) => {
  const dateInputValue = new Date(visit.visitDate).toISOString().split('T')[0];
  const directSelectionUrl = `${env.CLIENT_URL}/cart?date=${dateInputValue}&visitId=${visit._id}`;

  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const missingListText =
    missingItems.length > 0
      ? missingItems.map((item) => `  • ${item}`).join('\n')
      : '  • Select your dining menu dishes (up to 7 courses)';

  const subject = `Private Chef Missy - Please Complete Your Box Selection for ${visitDateFormatted}`;
  const message = `
Hello ${user.name},

Chef Missy has scheduled a meal box preparation for you for ${visitDateFormatted}.

--- Box Order Overview ---
Scheduled Date: ${visitDateFormatted}
Timeslot / Window: ${visit.arrivalWindow || 'To be confirmed'}
Portions: ${visit.guests || visit.adults || 2} Portions

To finalize your box, please complete the missing details:
${missingListText}

Click your direct box link below to open your portal, review details, and pack your box:
${directSelectionUrl}

We look forward to preparing your exquisite culinary selections!

Warm regards,
Private Chef Missy
`;

  return { subject, text: message.trim() };
};
