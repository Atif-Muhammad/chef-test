module.exports = ({ client, visit }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    recipient: client?._id || visit.userId,
    recipientRole: 'client',
    type: 'shopping_list_shared',
    title: 'Ingredients Shopping List Approved',
    previewDate: visitDateFormatted,
    previewTime: '',
    message: `Chef Missy has finalized and approved the ingredients shopping list for your upcoming box on ${visitDateFormatted}.`,
    link: `/visits/${visit._id}`,
    data: {
      visitId: visit._id,
      clientId: client?._id || visit.userId,
    },
  };
};
