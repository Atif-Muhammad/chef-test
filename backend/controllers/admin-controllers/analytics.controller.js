const Dish = require('../../models/shared/Dish');
const User = require('../../models/user-models/User');
const Visit = require('../../models/user-models/Visit');
const Favourite = require('../../models/user-models/Favourite');
const Category = require('../../models/shared/Category');
const Ingredient = require('../../models/shared/Ingredient');
const Allergen = require('../../models/shared/Allergy');

function parseDateRange(from, to) {
  const now = new Date();
  const endDate = to ? new Date(to) : new Date(now);
  if (to) {
    endDate.setHours(23, 59, 59, 999);
  }

  const startDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (from) {
    startDate.setHours(0, 0, 0, 0);
  }

  return {
    startDate,
    endDate,
    dateFilter: {
      createdAt: { $gte: startDate, $lte: endDate },
    },
  };
}

// 1. Stats & KPIs
exports.getStats = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { dateFilter } = parseDateRange(from, to);

    const [
      dishesCount,
      categoriesCount,
      ingredientsCount,
      allergensCount,
      clientsCount,
      submissionsCount,
      pendingVisitsCount,
      confirmedVisitsCount,
      completedVisitsCount,
      distinctDietaryTags,
    ] = await Promise.all([
      Dish.countDocuments(),
      Category.countDocuments(),
      Ingredient.countDocuments(),
      Allergen.countDocuments(),
      User.countDocuments(),
      Visit.countDocuments(dateFilter),
      Visit.countDocuments({ ...dateFilter, status: 'pending' }),
      Visit.countDocuments({ ...dateFilter, status: 'confirmed' }),
      Visit.countDocuments({ ...dateFilter, status: 'completed' }),
      Dish.distinct('dietaryTags'),
    ]);

    return res.json({
      stats: {
        dishesCount,
        categoriesCount,
        ingredientsCount,
        allergensCount,
        clientsCount,
        submissionsCount,
        pendingVisitsCount,
        confirmedVisitsCount,
        completedVisitsCount,
        dietaryTagsCount: distinctDietaryTags.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. Submission Trends Chart
exports.getTrends = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { startDate, endDate } = parseDateRange(from, to);

    const duration = Math.max(endDate.getTime() - startDate.getTime(), 24 * 60 * 60 * 1000);
    const intervals = 6;
    const step = duration / intervals;
    const trendPoints = [];

    for (let i = 0; i <= intervals; i++) {
      const pointTime = new Date(startDate.getTime() + i * step);
      const halfStep = step / 2;
      const pointStart = new Date(pointTime.getTime() - halfStep);
      const pointEnd = new Date(pointTime.getTime() + halfStep);

      const count = await Visit.countDocuments({
        createdAt: { $gte: pointStart, $lt: pointEnd },
      });

      trendPoints.push({
        date: pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        val: count,
      });
    }

    return res.json({ trendPoints });
  } catch (err) {
    next(err);
  }
};

// 3. Popular Dishes
exports.getPopularDishes = async (req, res, next) => {
  try {
    const popularFavs = await Favourite.aggregate([
      { $group: { _id: '$dishId', favCount: { $sum: 1 } } },
      { $sort: { favCount: -1 } },
      { $limit: 4 },
    ]);

    let popularDishes = [];
    if (popularFavs.length > 0) {
      const popularDishIds = popularFavs.map((f) => f._id);
      const populatedDishes = await Dish.find({ _id: { $in: popularDishIds } }).select('name photoUrl course');
      popularDishes = popularFavs.map((f) => {
        const found = populatedDishes.find((d) => d._id.toString() === f._id.toString());
        return {
          id: f._id,
          name: found?.name || 'Seasonal Dish',
          favCount: f.favCount,
          img: found?.photoUrl || '/assets/dishes/lemon-herb-salmon.png',
        };
      });
    } else {
      const fallbackDishes = await Dish.find({ isPublished: true }).limit(4).select('name photoUrl course');
      popularDishes = fallbackDishes.map((d) => ({
        id: d._id,
        name: d.name,
        favCount: 0,
        img: d.photoUrl || '/assets/dishes/lemon-herb-salmon.png',
      }));
    }

    return res.json({ popularDishes });
  } catch (err) {
    next(err);
  }
};

// 4. Recent Menu Submissions
exports.getRecentSubmissions = async (req, res, next) => {
  try {
    const { from, to, limit = 6 } = req.query;
    const { dateFilter } = parseDateRange(from, to);

    const recentVisits = await Visit.find(dateFilter)
      .populate('userId', 'name email phone location')
      .populate('dishes.dishId', 'name course photoUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 6);

    return res.json({ recentVisits });
  } catch (err) {
    next(err);
  }
};

// 5. Dietary Preferences
exports.getDietaryPreferences = async (req, res, next) => {
  try {
    const clientsWithDietary = await User.find().select('dietaryPreferences');
    const dietaryMap = {};
    let totalDietaryCount = 0;

    clientsWithDietary.forEach((c) => {
      if (Array.isArray(c.dietaryPreferences)) {
        c.dietaryPreferences.forEach((pref) => {
          dietaryMap[pref] = (dietaryMap[pref] || 0) + 1;
          totalDietaryCount++;
        });
      }
    });

    const colors = ['#e69d45', '#2563eb', '#059669', '#10b981', '#f97316', '#a855f7'];
    const dietaryPreferences = Object.entries(dietaryMap).map(([label, count], idx) => ({
      label,
      count,
      pct: totalDietaryCount > 0 ? Math.round((count / totalDietaryCount) * 100) : 0,
      color: colors[idx % colors.length],
    }));

    return res.json({ dietaryPreferences });
  } catch (err) {
    next(err);
  }
};

// 6. Aggregate fallback for full dashboard
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const { dateFilter, startDate, endDate } = parseDateRange(from, to);

    const [
      dishesCount,
      categoriesCount,
      ingredientsCount,
      allergensCount,
      clientsCount,
      submissionsCount,
      pendingVisitsCount,
      confirmedVisitsCount,
      completedVisitsCount,
      recentVisits,
      popularFavs,
      clientsWithDietary,
      distinctDietaryTags,
    ] = await Promise.all([
      Dish.countDocuments(),
      Category.countDocuments(),
      Ingredient.countDocuments(),
      Allergen.countDocuments(),
      User.countDocuments(),
      Visit.countDocuments(dateFilter),
      Visit.countDocuments({ ...dateFilter, status: 'pending' }),
      Visit.countDocuments({ ...dateFilter, status: 'confirmed' }),
      Visit.countDocuments({ ...dateFilter, status: 'completed' }),
      Visit.find(dateFilter)
        .populate('userId', 'name email phone location')
        .populate('dishes.dishId', 'name course photoUrl')
        .sort({ createdAt: -1 })
        .limit(6),
      Favourite.aggregate([
        { $group: { _id: '$dishId', favCount: { $sum: 1 } } },
        { $sort: { favCount: -1 } },
        { $limit: 4 },
      ]),
      User.find().select('dietaryPreferences'),
      Dish.distinct('dietaryTags'),
    ]);

    let popularDishes = [];
    if (popularFavs.length > 0) {
      const popularDishIds = popularFavs.map((f) => f._id);
      const populatedDishes = await Dish.find({ _id: { $in: popularDishIds } }).select('name photoUrl course');
      popularDishes = popularFavs.map((f) => {
        const found = populatedDishes.find((d) => d._id.toString() === f._id.toString());
        return {
          id: f._id,
          name: found?.name || 'Seasonal Dish',
          favCount: f.favCount,
          img: found?.photoUrl || '/assets/dishes/lemon-herb-salmon.png',
        };
      });
    } else {
      const fallbackDishes = await Dish.find({ isPublished: true }).limit(4).select('name photoUrl course');
      popularDishes = fallbackDishes.map((d) => ({
        id: d._id,
        name: d.name,
        favCount: 0,
        img: d.photoUrl || '/assets/dishes/lemon-herb-salmon.png',
      }));
    }

    const dietaryMap = {};
    let totalDietaryCount = 0;
    clientsWithDietary.forEach((c) => {
      if (Array.isArray(c.dietaryPreferences)) {
        c.dietaryPreferences.forEach((pref) => {
          dietaryMap[pref] = (dietaryMap[pref] || 0) + 1;
          totalDietaryCount++;
        });
      }
    });

    const colors = ['#e69d45', '#2563eb', '#059669', '#10b981', '#f97316', '#a855f7'];
    const dietaryPreferences = Object.entries(dietaryMap).map(([label, count], idx) => ({
      label,
      count,
      pct: totalDietaryCount > 0 ? Math.round((count / totalDietaryCount) * 100) : 0,
      color: colors[idx % colors.length],
    }));

    const duration = Math.max(endDate.getTime() - startDate.getTime(), 24 * 60 * 60 * 1000);
    const intervals = 6;
    const step = duration / intervals;
    const trendPoints = [];

    for (let i = 0; i <= intervals; i++) {
      const pointTime = new Date(startDate.getTime() + i * step);
      const halfStep = step / 2;
      const pointStart = new Date(pointTime.getTime() - halfStep);
      const pointEnd = new Date(pointTime.getTime() + halfStep);

      const count = await Visit.countDocuments({
        createdAt: { $gte: pointStart, $lt: pointEnd },
      });

      trendPoints.push({
        date: pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        val: count,
      });
    }

    return res.json({
      stats: {
        dishesCount,
        categoriesCount,
        ingredientsCount,
        allergensCount,
        clientsCount,
        submissionsCount,
        pendingVisitsCount,
        confirmedVisitsCount,
        completedVisitsCount,
        dietaryTagsCount: distinctDietaryTags.length,
      },
      recentVisits,
      popularDishes,
      dietaryPreferences,
      trendPoints,
    });
  } catch (err) {
    next(err);
  }
};

