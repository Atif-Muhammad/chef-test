const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    defaultUnit: {
      type: String,
      default: 'g',
      trim: true,
    },
    category: {
      type: String,
      default: 'Pantry',
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ingredient', IngredientSchema);
