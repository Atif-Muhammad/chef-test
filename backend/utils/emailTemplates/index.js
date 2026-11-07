const orderSubmission = require('./orderSubmission.template');
const visitStatusUpdate = require('./visitStatusUpdate.template');
const incompleteAppointment = require('./incompleteAppointment.template');
const shoppingListShared = require('./shoppingListShared.template');
const visitReminder = require('./visitReminder.template');
const passwordReset = require('./passwordReset.template');
const adminNewOrderAlert = require('./adminNewOrderAlert.template');

module.exports = {
  orderSubmission,
  visitStatusUpdate,
  incompleteAppointment,
  shoppingListShared,
  visitReminder,
  passwordReset,
  adminNewOrderAlert,
};
