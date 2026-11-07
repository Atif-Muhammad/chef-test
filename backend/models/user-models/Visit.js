const mongoose = require('mongoose');

const VisitDishSchema = new mongoose.Schema(
  {
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true,
    },
    course: {
      type: String,
      enum: ['main', 'dessert', 'kids'],
      default: 'main',
    },
    customNotes: {
      type: String,
      default: '',
    },
    adjustedIngredients: [
      {
        name: { type: String, required: true },
        qty: { type: Number, default: 0 },
        unit: { type: String, default: '' },
        substitution: { type: String, default: '' },
        exclusion: { type: Boolean, default: false },
      },
    ],
  },
  { _id: false }
);

const ShoppingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    substitution: {
      type: String,
      default: '',
      trim: true,
    },
    adminAdjustment: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const VisitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    adults: {
      type: Number,
      default: 2,
      min: 1,
    },
    children: {
      type: Number,
      default: 0,
      min: 0,
    },
    childrenAges: {
      type: String,
      default: '',
      trim: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    specialRequests: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    preparedBy: {
      type: String,
      default: 'Chef Missy',
      trim: true,
    },
    dishes: {
      type: [VisitDishSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    arrivalWindow: {
      type: String,
      default: '',
      trim: true,
    },
    chefNotes: {
      type: String,
      default: '',
      trim: true,
    },
    cancellationReason: {
      type: String,
      default: '',
      trim: true,
    },
    cancelledBy: {
      type: String,
      enum: ['client', 'admin', null],
      default: null,
    },
    shoppingList: {
      type: [ShoppingItemSchema],
      default: [],
    },
    shoppingListShared: {
      type: Boolean,
      default: false,
    },
    scheduledByAdmin: {
      type: Boolean,
      default: false,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visit', VisitSchema);
