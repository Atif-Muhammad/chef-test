const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const userAuthController = require('../../controllers/user-controllers/auth.controller');
const selectionController = require('../../controllers/user-controllers/selection.controller');
const favouriteController = require('../../controllers/user-controllers/favourite.controller');
const { requireClient } = require('../../middleware/auth.middleware');
const Allergy = require('../../models/shared/Allergy');

// Multer storage for client profile photos -> /uploads/clients/[clientid]/[filename]
const clientPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const clientId = String(req.user?.id || req.user?._id || 'unknown');
    const dir = path.join(__dirname, '..', '..', 'uploads', 'clients', clientId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jfif' || ext === '.jpe') ext = '.jpg';
    cb(null, `photo-${Date.now()}-${uuidv4()}${ext}`);
  },
});

const clientPhotoFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const uploadClientPhoto = multer({
  storage: clientPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: clientPhotoFilter,
});

// All user routes require client role
router.use(requireClient);

// Profile
router.put('/profile', userAuthController.updateProfile);
router.post('/profile/photo', uploadClientPhoto.single('photo'), userAuthController.uploadProfilePhoto);
router.put('/profile/photo', uploadClientPhoto.single('photo'), userAuthController.uploadProfilePhoto);

// Master Allergens catalog for clients
router.get('/allergens', async (req, res, next) => {
  try {
    const allergens = await Allergy.find().sort({ name: 1 });
    return res.json({ allergens });
  } catch (err) {
    next(err);
  }
});

// Visits & Selections
router.post('/visits', selectionController.createVisitSelection);
router.get('/visits/history', selectionController.getVisitHistory);
router.get('/visits/by-date', selectionController.getVisitByDate);
router.get('/visits/:id', selectionController.getVisitById);
router.patch('/visits/:id/cancel', selectionController.cancelVisitSelection);

// Favourites
router.get('/favourites', favouriteController.getFavourites);
router.post('/favourites/:dishId', favouriteController.addFavourite);
router.delete('/favourites/:dishId', favouriteController.removeFavourite);

module.exports = router;
