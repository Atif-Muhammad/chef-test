module.exports = ({ client, visit }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const previewTime = (visit.arrivalWindow || 'As scheduled').trim();

  return {
    recipient: client?._id || visit.userId,
    recipientRole: 'client',
    type: 'order_ready',
    title: 'Your Meal Box is Ready!',
    previewDate: visitDateFormatted,
    previewTime,
    message: `Your customized meal box is freshly prepared, packaged, and ready for pickup or outbound dispatch! Click to review details.`,
    link: `/history?visitId=${visit._id}`,
    data: {
      visitId: visit._id,
      clientId: client?._id || visit.userId,
    },
  };
};
