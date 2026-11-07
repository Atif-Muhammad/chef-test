const env = require('../../config/env');

module.exports = ({ user, visit, dishes }) => {
  const dishList = (dishes || []).map((d) => `- ${d.name} (${d.course || 'main'})`).join('\n');
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const subject = 'Private Chef Missy - Menu Submitted (Pending Approval)';
  const message = `
Hello ${user.name},

Thank you for selecting your dishes! Chef Missy will personally review your menu and any special requests before confirming your selection.

Visit Date: ${visitDateFormatted}
Guests: ${visit.adults || 2} Adults, ${visit.children || 0} Children${visit.childrenAges ? ` (Ages: ${visit.childrenAges})` : ''}

Status: Pending Approval

Selected Dishes (${(dishes || []).length}/7):
${dishList}

Special Requests: ${visit.specialRequests || visit.notes || 'None'}

What happens next?
1. Your menu and special requests will be reviewed.
2. We'll contact you if any adjustments are needed.
3. Your menu will be confirmed once approved by Chef Missy.
4. You'll receive a shopping list once your menu is confirmed.
5. Your meals will be freshly prepared for your scheduled visit.

Warm regards,
Private Chef Missy
`;

  return { subject, text: message.trim() };
};
