module.exports = ({ client, visit, dishes }) => {
  const visitDateFormatted = new Date(visit.visitDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const previewTime = (visit.arrivalWindow || 'Timeslot pending').trim();
  const dishCount = dishes ? dishes.length : (visit.dishes ? visit.dishes.length : 0);
  const clientName = client?.name || 'Private Client';
  const portions = visit.guests || visit.adults || 2;

  return {
    recipientRole: 'admin',
    type: 'new_order',
    title: 'New Meal Box Order Placed',
    previewDate: visitDateFormatted,
    previewTime,
    message: `${clientName} has submitted a new meal box order for ${portions} portions (${dishCount} dishes selected). Please review menu choices and confirm preparation window.`,
    link: `/admin/selections?visitId=${visit._id}`,
    data: {
      visitId: visit._id,
      clientId: client?._id,
      metadata: { portions, dishCount },
    },
  };
};
