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
    type: 'order_cancelled',
    title: 'Box Order Cancelled',
    previewDate: visitDateFormatted,
    previewTime: '',
    message: `Your dining box scheduled for ${visitDateFormatted} has been cancelled.${visit.cancellationReason ? ` Reason: "${visit.cancellationReason}"` : ''}`,
    link: `/history?visitId=${visit._id}`,
    data: {
      visitId: visit._id,
      clientId: client?._id || visit.userId,
    },
  };
};
