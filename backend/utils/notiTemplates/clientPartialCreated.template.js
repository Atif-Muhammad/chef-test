module.exports = ({ client, visit }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const previewTime = (visit.arrivalWindow || 'Timeslot pending').trim();
  const dateInputValue = new Date(visit.visitDate).toISOString().split('T')[0];

  return {
    recipient: client?._id || visit.userId,
    recipientRole: 'client',
    type: 'partial_created',
    title: 'Dining Box Scheduled — Select Your Dishes',
    previewDate: visitDateFormatted,
    previewTime,
    message: `Chef Missy has scheduled a dining appointment for you on ${visitDateFormatted}. Click to choose your chef-crafted dishes and customize your box.`,
    link: `/cart?date=${dateInputValue}&visitId=${visit._id}`,
    data: {
      visitId: visit._id,
      clientId: client?._id || visit.userId,
    },
  };
};
