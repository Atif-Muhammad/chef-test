const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    allergies: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    dob: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      default: '',
      trim: true,
    },
    dietaryPreferences: {
      type: [String],
      default: [],
    },
    dislikedIngredients: {
      type: [String],
      default: [],
    },
    adultsCount: {
      type: Number,
      default: 2,
    },
    childrenCount: {
      type: Number,
      default: 0,
    },
    childrenAges: {
      type: String,
      default: '',
      trim: true,
    },
    specialRequests: {
      type: String,
      default: '',
      trim: true,
    },
    favouriteDishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
      },
    ],
    role_client: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'terminated'],
      default: 'active',
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
