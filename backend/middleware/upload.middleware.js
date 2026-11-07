const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const rawName = (req.dish && req.dish.name) || req.body.dishName || req.body.name || req.query.dishName || 'dish';
    const slug = String(rawName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'dish';

    const dir = path.join(__dirname, '..', 'uploads', slug);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jfif' || ext === '.jpe') ext = '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

module.exports = upload;
