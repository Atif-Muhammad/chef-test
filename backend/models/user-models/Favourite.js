const mongoose = require('mongoose');

const FavouriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true,
    },
  },
  { timestamps: true }
);

FavouriteSchema.index({ userId: 1, dishId: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', FavouriteSchema);
