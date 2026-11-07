const env = require('../../config/env');

module.exports = ({ client, visit, dishes }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const subject = `[New Order] ${client?.name || 'Client'} - ${visitDateFormatted}`;
  const message = `
Chef Missy,

A new meal box order has been submitted by ${client?.name || 'a client'} (${client?.email || 'N/A'}).

Order Summary:
- Scheduled Date: ${visitDateFormatted}
- Window: ${visit.arrivalWindow || 'Unspecified'}
- Portions: ${visit.guests || 2}
- Total Dishes: ${(dishes || visit.dishes || []).length}

Review this request and confirm the appointment:
${env.CLIENT_URL}/admin/selections?visitId=${visit._id}

Private Chef Missy System
`;

  return { subject, text: message.trim() };
};
