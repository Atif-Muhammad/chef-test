const fs = require('fs');
const path = require('path');
const Dish = require('../../models/shared/Dish');
const Category = require('../../models/shared/Category');
const { serializeDish, serializeDishes } = require('../../services/shared/dishSerializer');

// Dish CRUD
exports.getAllDishesAdmin = async (req, res, next) => {
  try {
    const dishes = await Dish.find().populate('categoryId', 'name slug').sort({ createdAt: -1 });
    return res.json({ dishes: serializeDishes(dishes, true) });
  } catch (err) {
    next(err);
  }
};

exports.getDishByIdAdmin = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('categoryId', 'name slug');
    if (!dish) return res.status(404).json({ message: 'Dish not found.' });
    return res.json({ dish: serializeDish(dish, true) });
  } catch (err) {
    next(err);
  }
};

exports.createDish = async (req, res, next) => {
  try {
    if (Array.isArray(req.body.photos) && req.body.photos.length > 0 && !req.body.photoUrl) {
      req.body.photoUrl = req.body.photos[0];
    } else if (req.body.photoUrl && (!req.body.photos || req.body.photos.length === 0)) {
      req.body.photos = [req.body.photoUrl];
    }
    if (req.body.isKidsMeal !== undefined || req.body.suitableForAges1to5 !== undefined) {
      const isKids = Boolean(req.body.isKidsMeal || req.body.suitableForAges1to5);
      req.body.isKidsMeal = isKids;
      req.body.suitableForAges1to5 = isKids;
    }
    const dish = await Dish.create(req.body);
    const populated = await Dish.findById(dish._id).populate('categoryId', 'name slug');
    return res.status(201).json({ dish: serializeDish(populated, true) });
  } catch (err) {
    next(err);
  }
};

exports.updateDish = async (req, res, next) => {
  try {
    const existing = await Dish.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Dish not found.' });

    // Handle photo removal from disk folder if photos list was modified directly
    if (Array.isArray(req.body.photos)) {
      const oldPhotos = Array.isArray(existing.photos) && existing.photos.length > 0
        ? existing.photos
        : existing.photoUrl ? [existing.photoUrl] : [];

      const removedPhotos = oldPhotos.filter((p) => !req.body.photos.includes(p));
      for (const remUrl of removedPhotos) {
        try {
          const filePath = path.join(__dirname, '..', '..', remUrl.replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.warn('Error removing deleted image file:', remUrl, err.message);
        }
      }

      req.body.photoUrl = req.body.photos[0] || '';
    }

    // If dish name changed, rename upload directory and update photo URLs
    if (req.body.name && req.body.name !== existing.name) {
      const oldSlug = (existing.name || 'dish').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newSlug = (req.body.name || 'dish').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (oldSlug !== newSlug) {
        const oldDir = path.join(__dirname, '..', '..', 'uploads', oldSlug);
        const newDir = path.join(__dirname, '..', '..', 'uploads', newSlug);
        if (fs.existsSync(oldDir)) {
          if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
          const files = fs.readdirSync(oldDir);
          files.forEach((f) => fs.renameSync(path.join(oldDir, f), path.join(newDir, f)));
          try { fs.rmdirSync(oldDir); } catch (e) {}
        }

        const photosList = Array.isArray(req.body.photos) ? req.body.photos : existing.photos || [];
        const updatedUrls = photosList.map((u) => u.replace(`/uploads/${oldSlug}/`, `/uploads/${newSlug}/`));
        req.body.photos = updatedUrls;
        req.body.photoUrl = updatedUrls[0] || '';
      }
    }

    if (req.body.isKidsMeal !== undefined || req.body.suitableForAges1to5 !== undefined) {
      const isKids = Boolean(req.body.isKidsMeal || req.body.suitableForAges1to5);
      req.body.isKidsMeal = isKids;
      req.body.suitableForAges1to5 = isKids;
    }

    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name slug');

    return res.json({ dish: serializeDish(dish, true) });
  } catch (err) {
    next(err);
  }
};

exports.deleteDish = async (req, res, next) => {
  try {
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) return res.status(404).json({ message: 'Dish not found.' });

    // Remove dish upload folder from disk
    const slug = (dish.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (slug) {
      const dir = path.join(__dirname, '..', '..', 'uploads', slug);
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }

    return res.json({ message: 'Dish and photos deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.updateDishPhotos = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('categoryId', 'name slug');
    if (!dish) return res.status(404).json({ message: 'Dish not found.' });

    const slug = (dish.name || 'dish')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'dish';

    // Parse kept existing photos
    let keptPhotos = [];
    if (req.body.keepPhotos) {
      try {
        keptPhotos = Array.isArray(req.body.keepPhotos)
          ? req.body.keepPhotos
          : JSON.parse(req.body.keepPhotos);
      } catch (e) {
        keptPhotos = typeof req.body.keepPhotos === 'string' ? [req.body.keepPhotos] : [];
      }
    } else if (req.body.photos && typeof req.body.photos === 'string') {
      try {
        keptPhotos = JSON.parse(req.body.photos);
      } catch (e) {
        keptPhotos = [];
      }
    }

    // Newly uploaded files from multer
    const newFiles = req.files || (req.file ? [req.file] : []);
    const newUrls = newFiles.map((f) => `/uploads/${slug}/${f.filename}`);

    const oldPhotos = Array.isArray(dish.photos) && dish.photos.length > 0
      ? dish.photos
      : dish.photoUrl ? [dish.photoUrl] : [];

    // Delete any removed photos from disk
    const removedPhotos = oldPhotos.filter((p) => !keptPhotos.includes(p));
    for (const remUrl of removedPhotos) {
      try {
        const filePath = path.join(__dirname, '..', '..', remUrl.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('Error deleting photo from disk:', remUrl, err.message);
      }
    }

    // Combine kept + newly uploaded (max 3 images)
    const combinedPhotos = [...keptPhotos, ...newUrls].slice(0, 3);
    dish.photos = combinedPhotos;
    dish.photoUrl = combinedPhotos[0] || '';
    await dish.save();

    return res.json({
      message: 'Dish photos updated successfully.',
      dish: serializeDish(dish, true),
      photos: dish.photos,
      photoUrl: dish.photoUrl,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDishPhoto = exports.updateDishPhotos;

// Category CRUD
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    return res.json({ categories });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, order } = req.body;
    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      order: order || 0,
    });
    return res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    return res.json({ category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    return res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
