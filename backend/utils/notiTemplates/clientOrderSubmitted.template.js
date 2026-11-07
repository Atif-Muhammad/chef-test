module.exports = ({ client, visit }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const previewTime = (visit.arrivalWindow || 'Timeslot pending').trim();

  return {
    recipient: client?._id || visit.userId,
    recipientRole: 'client',
    type: 'order_submitted',
    title: 'Meal Box Order Submitted',
    previewDate: visitDateFormatted,
    previewTime,
    message: `Thank you! Your meal box order for ${visitDateFormatted} has been submitted for Chef Missy's personal review and preparation approval.`,
    link: `/history?visitId=${visit._id}`,
    data: {
      visitId: visit._id,
      clientId: client?._id || visit.userId,
    },
  };
};
