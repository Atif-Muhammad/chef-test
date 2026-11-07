exports.uploadPhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided.' });
  }

  // Returns relative path as required by image_storage_rule
  const photoUrl = `/uploads/dishes/${req.file.filename}`;
  return res.status(201).json({
    message: 'File uploaded successfully.',
    photoUrl,
  });
};
