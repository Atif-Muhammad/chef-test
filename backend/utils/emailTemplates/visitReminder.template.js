module.exports = ({ user, visit }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const subject = 'Reminder: Your Private Chef Visit in 48 Hours';
  const message = `
Hello ${user.name},

This is a friendly reminder that your private chef visit with Chef Missy is scheduled in 48 hours on ${visitDateFormatted}.

Guests: ${visit.guests}

If you have any last-minute updates or questions, please let us know.

Warm regards,
Private Chef Missy
`;

  return { subject, text: message.trim() };
};
