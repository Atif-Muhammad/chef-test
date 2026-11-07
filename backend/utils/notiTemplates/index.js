const adminNewOrder = require('./adminNewOrder.template');
const clientOrderSubmitted = require('./clientOrderSubmitted.template');
const clientPartialCreated = require('./clientPartialCreated.template');
const clientOrderConfirmed = require('./clientOrderConfirmed.template');
const clientOrderReady = require('./clientOrderReady.template');
const clientOrderCompleted = require('./clientOrderCompleted.template');
const clientOrderCancelled = require('./clientOrderCancelled.template');
const clientShoppingListShared = require('./clientShoppingListShared.template');

module.exports = {
  adminNewOrder,
  clientOrderSubmitted,
  clientPartialCreated,
  clientOrderConfirmed,
  clientOrderReady,
  clientOrderCompleted,
  clientOrderCancelled,
  clientShoppingListShared,
};
