const env = require('../../config/env');

module.exports = ({ user, visit, shoppingList }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const itemsText = (shoppingList || [])
    .map((item) => `- ${item.name}: ${item.quantity} ${item.unit}${item.substitution ? ` (Sub: ${item.substitution})` : ''}`)
    .join('\n');

  const subject = `Private Chef Missy - Your Shopping List for ${visitDateFormatted}`;
  const message = `
Hello ${user.name},

Chef Missy has finalized and approved your shopping list for your upcoming visit on ${visitDateFormatted}!

Visit Summary:
- Adults: ${visit.adults || 2}, Children: ${visit.children || 0}${visit.childrenAges ? ` (Ages: ${visit.childrenAges})` : ''}
- Arrival Window: ${visit.arrivalWindow || 'To be confirmed'}

Approved Ingredients Shopping List:
${itemsText}

You can also view your visit details and menu anytime on your client portal:
${env.CLIENT_URL}/visits/${visit._id}

Warm regards,
Private Chef Missy
`;

  return { subject, text: message.trim() };
};
