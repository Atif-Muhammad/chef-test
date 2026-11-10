const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    qtyPer2: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const DishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    photos: {
      type: [String],
      default: [],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    cuisineTags: {
      type: [String],
      default: [],
    },
    dietaryTags: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [IngredientSchema],
      default: [],
    },
    storageInstructions: {
      type: String,
      default: '',
    },
    storageDuration: {
      type: String,
      default: '',
    },
    freezingSuitability: {
      type: Boolean,
      default: false,
    },
    reheatingInstructions: {
      type: String,
      default: '',
    },
    cookingInstructions: {
      type: String,
      default: '',
    },
    spiceLevel: {
      type: String,
      enum: ['none', 'mild', 'medium', 'spicy'],
      default: 'none',
    },
    nutritionalHighlights: {
      type: [String],
      default: [],
    },
    baseServings: {
      type: Number,
      default: 2,
    },
    isTimeIntensive: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isKidsMeal: {
      type: Boolean,
      default: false,
    },
    suitableForAges1to5: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['main', 'side', 'soup', 'dessert', 'kids', 'starter'],
      default: 'main',
    },
  },
  { timestamps: true }
);

DishSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Dish', DishSchema);
