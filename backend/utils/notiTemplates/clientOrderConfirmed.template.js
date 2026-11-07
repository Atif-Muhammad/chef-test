module.exports = ({ client, visit }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const previewTime = (visit.arrivalWindow || 'Window confirmed').trim();

  return {
    recipient: client?._id || visit.userId,
    recipientRole: 'client',
    type: 'order_confirmed',
    title: 'Meal Box Order Confirmed',
    previewDate: visitDateFormatted,
    previewTime,
    message: `Chef Missy has reviewed your menu selections and confirmed your box order for ${visitDateFormatted} (${previewTime}). Click to view your full box details.`,
    link: `/history?visitId=${visit._id}`,
    data: {
      visitId: visit._id,
      clientId: client?._id || visit.userId,
    },
  };
};
