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
    type: 'order_completed',
    title: 'Box Order Completed',
    previewDate: visitDateFormatted,
    previewTime: '',
    message: `Your meal box order for ${visitDateFormatted} has been completed. Thank you for dining with Chef Missy!`,
    link: `/history?visitId=${visit._id}`,
    data: {
      visitId: visit._id,
      clientId: client?._id || visit.userId,
    },
  };
};
