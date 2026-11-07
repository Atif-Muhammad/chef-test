const Favourite = require('../../models/user-models/Favourite');
const User = require('../../models/user-models/User');
const Dish = require('../../models/shared/Dish');
const { serializeDishes } = require('../../services/shared/dishSerializer');

exports.addFavourite = async (req, res, next) => {
  try {
    const { dishId } = req.params;
    const dish = await Dish.findById(dishId);
    if (!dish) return res.status(404).json({ message: 'Dish not found.' });

    // Push dish ID into user's favouriteDishes array field
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favouriteDishes: dish._id } },
      { new: true }
    );

    // Keep Favourite collection synced
    const fav = await Favourite.findOneAndUpdate(
      { userId: req.user.id, dishId: dish._id },
      { userId: req.user.id, dishId: dish._id },
      { upsert: true, new: true }
    );

    return res.status(201).json({ message: 'Added to favourites.', favourite: fav });
  } catch (err) {
    next(err);
  }
};

exports.removeFavourite = async (req, res, next) => {
  try {
    const { dishId } = req.params;

    // Pull dish ID from user's favouriteDishes array field
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favouriteDishes: dishId } },
      { new: true }
    );

    // Keep Favourite collection synced
    await Favourite.findOneAndDelete({ userId: req.user.id, dishId });
    return res.json({ message: 'Removed from favourites.' });
  } catch (err) {
    next(err);
  }
};

exports.getFavourites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favouriteDishes',
      populate: { path: 'categoryId', select: 'name slug' },
    });

    let dishes = (user?.favouriteDishes || []).filter((d) => d && d.isPublished);

    // Fallback migration from legacy Favourite collection if array field was empty
    if (dishes.length === 0) {
      const favs = await Favourite.find({ userId: req.user.id }).populate({
        path: 'dishId',
        populate: { path: 'categoryId', select: 'name slug' },
      });

      const fallbackDishes = favs
        .filter((f) => f.dishId && f.dishId.isPublished)
        .map((f) => f.dishId);

      if (fallbackDishes.length > 0) {
        dishes = fallbackDishes;
        await User.findByIdAndUpdate(req.user.id, {
          $addToSet: { favouriteDishes: { $each: fallbackDishes.map((d) => d._id) } },
        });
      }
    }

    const serialized = serializeDishes(dishes, false);
    return res.json({ favourites: serialized });
  } catch (err) {
    next(err);
  }
};
