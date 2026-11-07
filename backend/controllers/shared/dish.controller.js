const Dish = require('../../models/shared/Dish');
const Category = require('../../models/shared/Category');
const { serializeDish, serializeDishes } = require('../../services/shared/dishSerializer');

exports.getDishes = async (req, res, next) => {
  try {
    const { category, search, type, isTimeIntensive, isKidsMeal, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        query.categoryId = cat._id;
      }
    }

    if (type) {
      query.type = type;
    }

    if (isTimeIntensive !== undefined) {
      query.isTimeIntensive = isTimeIntensive === 'true';
    }

    if (isKidsMeal !== undefined) {
      query.isKidsMeal = isKidsMeal === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [dishes, total] = await Promise.all([
      Dish.find(query).populate('categoryId', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Dish.countDocuments(query),
    ]);

    const isAdmin = req.user && req.user.role === 'admin';
    const serialized = serializeDishes(dishes, isAdmin);

    return res.json({
      dishes: serialized,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getDishById = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('categoryId', 'name slug');
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found.' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    if (!dish.isPublished && !isAdmin) {
      return res.status(404).json({ message: 'Dish not found.' });
    }

    return res.json({
      dish: serializeDish(dish, isAdmin),
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    return res.json({ categories });
  } catch (err) {
    next(err);
  }
};
