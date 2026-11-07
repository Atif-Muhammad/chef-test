const Ingredient = require('../../models/shared/Ingredient');

exports.getIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find().sort({ category: 1, name: 1 });
    return res.json({ ingredients });
  } catch (err) {
    next(err);
  }
};

exports.createIngredient = async (req, res, next) => {
  try {
    const { name, defaultUnit, category, aliases } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Ingredient name is required.' });
    }

    const existing = await Ingredient.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Ingredient already exists.' });
    }

    const parsedAliases = Array.isArray(aliases)
      ? aliases.map((a) => a.trim()).filter(Boolean)
      : typeof aliases === 'string'
      ? aliases.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const ingredient = await Ingredient.create({
      name: name.trim(),
      defaultUnit: (defaultUnit || 'g').trim(),
      category: (category || 'Pantry').trim(),
      aliases: parsedAliases,
    });

    return res.status(201).json({ ingredient });
  } catch (err) {
    next(err);
  }
};

exports.updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, defaultUnit, category, aliases } = req.body;

    const parsedAliases = Array.isArray(aliases)
      ? aliases.map((a) => a.trim()).filter(Boolean)
      : typeof aliases === 'string'
      ? aliases.split(',').map((a) => a.trim()).filter(Boolean)
      : undefined;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (defaultUnit) updateData.defaultUnit = defaultUnit.trim();
    if (category) updateData.category = category.trim();
    if (parsedAliases !== undefined) updateData.aliases = parsedAliases;

    const ingredient = await Ingredient.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found.' });
    }

    return res.json({ ingredient });
  } catch (err) {
    next(err);
  }
};

exports.deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByIdAndDelete(id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found.' });
    }
    return res.json({ message: 'Ingredient deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
