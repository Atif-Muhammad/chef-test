const env = require('../../config/env');

module.exports = ({ user, visit, updateType }) => {
  let subject = 'Private Chef Missy - Appointment Update';
  let message = '';

  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (updateType === 'confirmed') {
    subject = '✓ Your Private Chef Visit is Confirmed!';
    message = `
Hello ${user.name},

Great news! Chef Missy has reviewed your menu selections and confirmed your private chef dining visit.

--- Visit Details ---
Date: ${visitDateFormatted}
Guests: ${visit.guests}
Estimated Chef Arrival Window: ${visit.arrivalWindow || 'To be confirmed by Chef Missy'}

${visit.chefNotes ? `Chef Missy's Preparation Notes:\n"${visit.chefNotes}"\n` : ''}

You can view your full menu and visit details anytime at:
${env.CLIENT_URL}/visits/${visit._id}

We look forward to an exquisite culinary experience!
Warm regards,
Private Chef Missy
`;
  } else if (updateType === 'ready') {
    subject = '✓ Your Meal Box is Ready for Pickup / Dispatch!';
    message = `
Hello ${user.name},

Great news! Chef Missy has prepared and packed your customized meal box. It is now ready for pickup / outbound dispatch!

--- Box & Delivery Details ---
Date: ${visitDateFormatted}
Portions: ${visit.guests}
Pickup / Delivery Window: ${visit.arrivalWindow || 'As scheduled'}

${visit.chefNotes ? `Chef Missy's Notes:\n"${visit.chefNotes}"\n` : ''}

You can review your order and meal box details anytime at:
${env.CLIENT_URL}/history

Warm regards,
Private Chef Missy
`;
  } else if (updateType === 'cancelled') {
    subject = 'Private Chef Missy - Visit Cancelled';
    message = `
Hello ${user.name},

Your private dining visit scheduled for ${visitDateFormatted} has been cancelled.

${visit.cancellationReason ? `Reason:\n"${visit.cancellationReason}"\n` : ''}

If you would like to reschedule for an alternative date or have any questions, please explore our seasonal catalogue or get in touch.

Browse menu & schedule a new visit:
${env.CLIENT_URL}/catalogue

Warm regards,
Private Chef Missy
`;
  } else if (updateType === 'completed') {
    subject = 'Thank you for dining with Private Chef Missy!';
    message = `
Hello ${user.name},

Thank you for hosting Chef Missy for your dining experience on ${visitDateFormatted}. It was a pleasure cooking for you and your guests!

You can review your menu and save your favourite dishes for future visits at:
${env.CLIENT_URL}/history

Warm regards,
Private Chef Missy
`;
  } else {
    subject = `Private Chef Missy - Visit Status: ${updateType}`;
    message = `
Hello ${user.name},

The status of your dining visit scheduled for ${visitDateFormatted} has been updated to "${updateType}".

View your visit details:
${env.CLIENT_URL}/visits/${visit._id}

Warm regards,
Private Chef Missy
`;
  }

  return { subject, text: message.trim() };
};
