const Allergy = require('../../models/shared/Allergy');

exports.getAllergens = async (req, res, next) => {
  try {
    const allergens = await Allergy.find().sort({ name: 1 });
    return res.json({ allergens });
  } catch (err) {
    next(err);
  }
};

exports.createAllergen = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Allergen name is required.' });
    }

    const cleanName = name.trim();
    const cleanSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '');

    const existing = await Allergy.findOne({
      $or: [{ name: cleanName }, { slug: cleanSlug }],
    });
    if (existing) {
      return res.status(400).json({ message: 'Allergen already exists.' });
    }

    const allergen = await Allergy.create({
      name: cleanName,
      slug: cleanSlug,
    });

    return res.status(201).json({ allergen });
  } catch (err) {
    next(err);
  }
};

exports.updateAllergen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (slug) {
      updateData.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else if (name) {
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const allergen = await Allergy.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!allergen) {
      return res.status(404).json({ message: 'Allergen not found.' });
    }

    return res.json({ allergen });
  } catch (err) {
    next(err);
  }
};

exports.deleteAllergen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allergen = await Allergy.findByIdAndDelete(id);
    if (!allergen) {
      return res.status(404).json({ message: 'Allergen not found.' });
    }
    return res.json({ message: 'Allergen deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
